import 'pdfjs-dist/legacy/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).href;

// prettier-ignore
const BULLET_POINTS = [
    "⋅", "∙", "🞄", "•", "⦁", "●", "⚫︎", "⬤", "⚬", "○",  
    "◦", "‣", "⁃", "-", "⁰", "✦", "✧", "✪", "❖", "✱", "⧫",    
    "◉", "✶", "✸", "✻", "✸", "✺", "✶", "✷", "*", "❍", "∗", "⁒", "⁋", "➤", "↣",
    "◆", "◇", "◁", "▷", "▶", "◀", "➔", "⤷", "➵", "⟶", "↘", "↗", "✵", "⏺", "↻", "⥳", "⥁"
];

const extractBulletPoints = (section) => {
  const bulletPoints = [];
  let currentItem = null;

  section.forEach((item) => {
    const text = item.str.trim();
    const isNewBullet = BULLET_POINTS.some((bullet) => text.startsWith(bullet));
    if (isNewBullet) {
      // If we were building a bullet, save it before starting a new one
      if (currentItem) {
        bulletPoints.push(currentItem);
      }

      // Start new bullet item
      currentItem = text;
    } else if (currentItem) {
      const lastChar = currentItem.trim().slice(-1);
      const needsSpace = lastChar !== '-';

      // Append continuation line, conditionally adding a space
      currentItem += (needsSpace ? ' ' : '') + text;
    }
  });

  // Push the last collected item if there is one
  if (currentItem) {
    bulletPoints.push(currentItem);
  }
  let result = [];
  let current = [];

  bulletPoints.forEach((item) => {
    if (
      BULLET_POINTS.some((symbol) => {
        return item.includes(symbol);
      })
    ) {
      if (current.length > 0) {
        result.push(current.join('')); // Join current section
      }
      current = [item]; // Start a new section with the "*"
    } else {
      current.push(item); // Add item to the current section
    }
  });

  // Push the last section if it exists
  if (current.length > 0) {
    result.push(current.join(''));
  }

  console.log(result);

  return result;
};

const getCleanedItems = async (page) => {
  const textContent = await page.getTextContent();

  let lines = [];
  let currentLine = [];

  let previousItem;
  textContent.items.forEach((item) => {
    if (!previousItem) {
      currentLine.push(item);
    } else if (
      previousItem &&
      Math.abs(previousItem.transform[5] - item.transform[5]) < 5
    ) {
      if (item.str.length > 0) currentLine.push(item);
    } else {
      if (currentLine.length > 0) lines.push(currentLine);
      if (item.str.length > 0) currentLine.push(item);
      currentLine = [];
    }
    // console.log(item.width);
    // console.log(item.height);
    // console.log(item.transform); // h scale, h skew, v skew, v scale, x, y
    previousItem = item;
  });
  lines.push(currentLine);
  // At this point, the lines are clean
  return lines;
};

const SECTION_TITLE_MAP = {
  experience: ['experience', 'work experience', 'professional experience'],
  education: ['education', 'academic background'],
  project: ['projects', 'personal projects', 'side projects'],
  skills: ['skills', 'technical skills', 'tools'],
  summary: ['summary', 'profile', 'professional summary'],
};

const getCanonicalSectionKey = (title) => {
  const normalized = title.toLowerCase().trim();
  for (const [canonicalKey, variants] of Object.entries(SECTION_TITLE_MAP)) {
    if (variants.some((variant) => normalized.includes(variant))) {
      return canonicalKey;
    }
  }
  return null; // fallback if no match
};

async function getSectionsFromCleanedItems(CLEANED_ITEMS, page) {
  await page.getOperatorList(); // ensure fonts are loaded

  const discovered_sections = {};
  let current_section = 'profile';
  let sectionDetected = false;
  let headerCount = 0;

  let firstHeaderInProfile = null;

  for (const line of CLEANED_ITEMS) {
    const isSingle = line.length === 1;
    const text = isSingle ? line[0].str.trim() : '';
    const fontName = isSingle
      ? page.commonObjs.get(line[0].fontName).name.toLowerCase()
      : '';

    const isBoldUppercase =
      isSingle && fontName.includes('bold') && text === text.toUpperCase();

    const isValidHeading =
      isSingle &&
      /^[A-Za-z\s&]+$/.test(text) &&
      text[0] === text[0].toUpperCase();

    const matchedKey = getCanonicalSectionKey(text);
    const isHeaderCandidate = isBoldUppercase || (isValidHeading && matchedKey);

    if (isHeaderCandidate) {
      headerCount++;

      if (headerCount === 1) {
        // treat first header as part of profile
        firstHeaderInProfile = text;
        // don't change current_section yet
      } else {
        // switch to canonical key or raw text
        current_section = matchedKey || text;
        continue;
      }
    }

    // Add to the current section
    if (discovered_sections[current_section]) {
      discovered_sections[current_section].push(line);
    } else {
      discovered_sections[current_section] = [line];
    }
  }

  return discovered_sections;
}

async function getWorkExperience(SECTIONS, page) {
  // prettier-ignore
  const WORK_EXPERIENCE_KEYWORDS_LOWERCASE = ['work', 'experience', 'employment', 'history', 'job'];
  // prettier-ignore
  const JOB_KEYWORDS = [
  'accountant', 'administrator', 'advisor', 'agent', 'analyst', 'apprentice',
  'architect', 'assistant', 'associate', 'auditor', 'bartender', 'biologist',
  'bookkeeper', 'buyer', 'carpenter', 'cashier', 'ceo', 'clerk', 'coop',
  'cofounder', 'consultant', 'coordinator', 'cto', 'developer', 'designer',
  'director', 'driver', 'editor', 'electrician', 'engineer', 'extern', 'founder',
  'freelancer', 'head', 'intern', 'janitor', 'journalist', 'laborer', 'lawyer',
  'lead', 'manager', 'mechanic', 'member', 'nurse', 'officer', 'operator',
  'operations', 'photographer', 'president', 'producer', 'recruiter',
  'representative', 'researcher', 'sales', 'server', 'scientist', 'specialist',
  'supervisor', 'teacher', 'technician', 'trader', 'trainee', 'treasurer',
  'tutor', 'vice', 'vp', 'volunteer', 'webmaster', 'worker',
  'developer', 'engineer', 'scientist', 'analyst', 'architect', 'designer',
  'marketer', 'strategist', 'writer', 'editor', 'researcher', 'technician',
  'recruiter', 'trainer', 'tester', 'manager', 'consultant', 'coordinator',
  'planner', 'supervisor', 'instructor', 'auditor', 'inspector', 'operator',
  'administrator', 'installer', 'assembler', 'dispatcher', 'economist',
  'statistician', 'psychologist', 'therapist', 'pharmacist', 'physician',
  'dentist', 'veterinarian', 'librarian', 'translator', 'interpreter',
  'coach', 'advisor', 'cleaner', 'caretaker', 'plumber', 'welder',
  'painter', 'roofer', 'mover', 'developer', 'designer', 'co-director'
];

  let work_section;
  for (let keyword of WORK_EXPERIENCE_KEYWORDS_LOWERCASE) {
    const MATCHED_SECTION = Object.keys(SECTIONS).find((sectionName) => {
      return sectionName.toLowerCase().includes(keyword);
    });

    // If a matched section is found, return it
    if (MATCHED_SECTION) {
      work_section = SECTIONS[MATCHED_SECTION];
    }
  }

  let subsections = getSubSections(work_section, page);

  const hasJobTitle = (item) =>
    JOB_KEYWORDS.some((jobTitle) =>
      item.str
        .toLowerCase()
        .split(/\s/)
        .some((word) => word === jobTitle)
    );
  const hasMoreThanFiveWords = (item) => item.str.split(' ').length > 5;
  const hasNumber = (item) => /\d/.test(item.str);

  const hasYear = (item) => /(?:19|20)\d{2}/.test(item.str);
  // prettier-ignore
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const hasMonth = (item) =>
    MONTHS.some(
      (month) =>
        item.str.includes(month) || item.str.includes(month.slice(0, 4))
    );
  const SEASONS = ['Summer', 'Fall', 'Spring', 'Winter'];
  const hasSeason = (item) =>
    SEASONS.some((season) =>
      item.str.toLowerCase().includes(season.toLowerCase())
    );
  const hasPresent = (item) => item.str.toLowerCase().includes('present');
  const hasText = (str) => (item) =>
    item.str.toLowerCase().includes(str.toLowerCase());
  const hasLettersOrSpace = (item) => {
    return /[A-Za-z\s]/.test(item.str.trim());
  };
  const hasComma = (item) => {
    return item.str.includes(',');
  };

  const hasWords = (item) => {};

  let output = [];

  subsections.forEach((subsection) => {
    let job = getBestItem(subsection, [
      [hasJobTitle, 10],
      [hasLettersOrSpace, 1],
      [hasMoreThanFiveWords, -3],
      [hasNumber, -5],
    ]);
    let date = getBestItem(subsection, [
      [hasMonth, 1],
      [hasSeason, 1],
      [hasPresent, 1],
      [hasYear, 1],
    ]);
    let company = getBestItem(subsection, [
      [hasLettersOrSpace, 10],
      [hasText(date[0].str), -10],
      [hasText(job[0].str), -10],
      [hasMonth, -10],
    ]);
    let bullets = extractBulletPoints(subsection);

    output.push({
      job_title: job[0].str,
      date: date[0].str,
      company: company[0].str,
      description: bullets,
    });
  });

  return output;
}

async function getProjects(SECTIONS, page) {
  // prettier-ignore
  const PROJECTS_KEYWORDS = ['project', 'portfolio'];

  const hasJobTitle = (item) =>
    JOB_KEYWORDS.some((jobTitle) =>
      item.str.split(/\s/).some((word) => word === jobTitle)
    );
  const hasMoreThanFiveWords = (item) => item.str.split(' ').length > 5;
  const hasNumber = (item) => /\d/.test(item.str);

  const hasYear = (item) => /(?:19|20)\d{2}/.test(item.str);
  // prettier-ignore
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const hasMonth = (item) =>
    MONTHS.some(
      (month) =>
        item.str.includes(month) || item.str.includes(month.slice(0, 4))
    );
  const SEASONS = ['Summer', 'Fall', 'Spring', 'Winter'];
  const hasSeason = (item) =>
    SEASONS.some((season) =>
      item.str.toLowerCase().includes(season.toLowerCase())
    );
  const hasPresent = (item) => item.str.toLowerCase().includes('present');
  const hasText = (str) => (item) =>
    item.str.toLowerCase().includes(str.toLowerCase());
  const hasLettersOrSpace = (item) => {
    return /[A-Za-z\s]/.test(item.str.trim());
  };
  const hasComma = (item) => {
    return item.str.includes(',');
  };

  let project_section;
  for (let keyword of PROJECTS_KEYWORDS) {
    const MATCHED_SECTION = Object.keys(SECTIONS).find((sectionName) => {
      return sectionName.toLowerCase().includes(keyword);
    });

    if (MATCHED_SECTION) {
      project_section = SECTIONS[MATCHED_SECTION];
    }
  }

  if (!project_section) return;
  let subsections = getSubSections(project_section, page);

  let output = [];

  subsections.forEach((subsection) => {
    let title = getBestItem(subsection, [
      [hasMoreThanFiveWords, -5],
      [hasNumber, -5],
      [hasLettersOrSpace, 10],
    ]);
    let date = getBestItem(subsection, [
      [hasMonth, 1],
      [hasSeason, 1],
      [hasPresent, 1],
      [hasYear, 1],
      [hasMoreThanFiveWords, -10],
    ]);
    let bullets = extractBulletPoints(subsection);
    output.push({
      title: title[0].str,
      date: date[0].str,
      description: bullets,
    });
  });

  return output;
}

function getBestItem(section, features) {
  let best_item = null;
  section.forEach((item) => {
    let itemScore = 0;
    features.forEach(([featureFn, weight]) => {
      if (featureFn(item)) itemScore += weight;
    });
    if (!best_item || itemScore > best_item[1]) {
      best_item = [item, itemScore];
    }
  });
  if (best_item[1] <= 0) {
    return [{ str: '' }, 0];
  }
  return best_item;
}

const getMode = (gaps) => {
  const frequency = {};
  gaps.forEach((gap) => {
    frequency[gap] = (frequency[gap] || 0) + 1;
  });

  let mode = null;
  let maxFrequency = 0;
  for (const gap in frequency) {
    if (frequency[gap] > maxFrequency) {
      maxFrequency = frequency[gap];
      mode = gap;
    }
  }
  return mode;
};
const getStandardDeviation = (gaps, mean) => {
  const variance =
    gaps.reduce((sum, gap) => sum + Math.pow(gap - mean, 2), 0) /
    (gaps.length - 1);
  return Math.sqrt(variance);
};

const getAvg = (gaps) => {
  let avgGap = 0;
  gaps.forEach((gap) => {
    avgGap += gap;
  });
  avgGap /= gaps.length;
  return avgGap;
};

const calculateAvgAndStd = (gaps) => {
  return {
    avg: getAvg(gaps),
    stdDev: getStandardDeviation(gaps, getAvg(gaps)),
  };
};

function getSubSections(section, page) {
  let currentSection = [];
  let sections = [];
  let gaps = [];

  let previousItem;

  section.flat().forEach((item) => {
    if (!previousItem) {
      currentSection.push(item);
      previousItem = item;
      return;
    }

    const verticalGap = Math.round(
      Math.abs(item.transform[5] - previousItem.transform[5])
    );
    if (verticalGap > 5) gaps.push(verticalGap);

    if (gaps.length > 0) {
      if (verticalGap > getAvg(gaps) * 1.4) {
        sections.push(currentSection);
        currentSection = [item];
      } else {
        currentSection.push(item);
      }
    } else {
      currentSection.push(item);
    }
    previousItem = item;
  });

  if (currentSection.length > 0) {
    sections.push(currentSection);
  }

  if (sections.length == 1) {
    sections = [];
    currentSection = [];
    const isLineNewSubsectionByBold = (line, prevLine) => {
      if (
        !page.commonObjs
          .get(prevLine[0].fontName)
          .name.toLowerCase()
          .includes('bold') &&
        page.commonObjs
          .get(line[0].fontName)
          .name.toLowerCase()
          .includes('bold') &&
        !BULLET_POINTS.includes(line[0].text)
      ) {
        return true;
      }
      return false;
    };

    section.forEach((line, index) => {
      if (index > 0 && isLineNewSubsectionByBold(line, section[index - 1])) {
        sections.push(currentSection);
        currentSection = [];
        line.forEach((item) => {
          currentSection.push(item);
        });
      } else {
        line.forEach((item) => {
          currentSection.push(item);
        });
      }
    });

    if (currentSection.length > 0) {
      sections.push(currentSection);
    }
  }

  return sections;
}

// async function main() {
//   const filePath = 'example3.pdf';
//   const loadingTask = pdfjsLib.getDocument(filePath);
//   const pdfDocument = await loadingTask.promise;
//   const page = await pdfDocument.getPage(1);

//   const CLEANED_ITEMS = await getCleanedItems(page).catch((err) =>
//     console.log('Error extracting from pdf', err)
//   );

//   const FOUND_SECTIONS = await getSectionsFromCleanedItems(
//     CLEANED_ITEMS,
//     page
//   ).catch((err) => console.log('Error extracting from pdf', err));

//   const WORK_EXPERIENCE = await getWorkExperience(FOUND_SECTIONS, page);
//   console.log(WORK_EXPERIENCE);

//   console.log('PROJECTS');
//   const PROJECTS = await getProjects(FOUND_SECTIONS, page);
//   console.log(PROJECTS);
// }

// main();

function extractProfileData(profileSection) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/i;
  const phoneRegex =
    /(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
  const urlRegex =
    /\b(https?:\/\/)?(www\.)?[\w\-]+\.[a-z]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?/gi;

  const flattened = profileSection.flat(); // remove line grouping
  const lines = flattened.map((item) => item.str.trim()).filter(Boolean);

  const result = {
    name: null,
    email: null,
    phone: null,
    links: [],
  };

  for (const line of lines) {
    // Try to get email
    if (!result.email && emailRegex.test(line)) {
      result.email = line.match(emailRegex)[0];
    }
    const domainFromEmail = result.email ? result.email.split('@')[1] : null;

    // Try to get phone
    if (!result.phone && phoneRegex.test(line)) {
      result.phone = line.match(phoneRegex)[0];
    }

    // Get all links
    const foundLinks = line.match(urlRegex);
    if (foundLinks) {
      result.links.push(
        ...foundLinks
          .map((l) => (l.startsWith('http') ? l : 'https://' + l))
          .filter((link) => {
            // Remove link if it's just the email domain (e.g., gmail.com)
            if (domainFromEmail && link.includes(domainFromEmail)) {
              return false;
            }
            // Remove exact match with email
            if (result.email && link === result.email) {
              return false;
            }
            return true;
          })
      );
    }
  }

  // Heuristic for name: top-most line with alphabetic content, no digits or symbols
  for (const line of lines) {
    if (
      /^[A-Za-z\s]+$/.test(line) &&
      line.split(' ').length <= 4 &&
      line.length >= 4 &&
      line.length <= 40
    ) {
      result.name = line;
      break;
    }
  }

  return result;
}

export async function readFile(pdfArrayBuffer) {
  const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
  const pdfDocument = await loadingTask.promise;
  const page = await pdfDocument.getPage(1);

  const CLEANED_ITEMS = await getCleanedItems(page).catch((err) => {
    console.error('Error extracting cleaned items from PDF:', err);
    return [];
  });

  const allWords = [];
  CLEANED_ITEMS.flat().forEach((item) => {
    allWords.push(item.str);
  });

  return allWords.join('\n');
}

export async function parseResumeData(pdfDocument) {
  const page = await pdfDocument.getPage(1);

  const CLEANED_ITEMS = await getCleanedItems(page).catch((err) => {
    console.error('Error extracting cleaned items from PDF:', err);
    return [];
  });

  const FOUND_SECTIONS = await getSectionsFromCleanedItems(
    CLEANED_ITEMS,
    page
  ).catch((err) => {
    console.error('Error extracting sections from PDF:', err);
    return {};
  });

  const WORK_EXPERIENCE = await getWorkExperience(FOUND_SECTIONS, page);
  const PROJECTS = await getProjects(FOUND_SECTIONS, page);
  const SUMMARY = (FOUND_SECTIONS.summary?.flat() || [])
    .map((item) => item.str)
    .join(' ');

  const SKILLS = (FOUND_SECTIONS.skills?.flat() || []).map((item) => item.str);
  const PROFILE = extractProfileData(FOUND_SECTIONS['profile']);
  const EDUCATION = (FOUND_SECTIONS.education?.flat() || []).map(
    (item) => item.str
  );

  return {
    workExperience: WORK_EXPERIENCE,
    projects: PROJECTS,
    summary: SUMMARY,
    skills: SKILLS,
    profile: PROFILE,
    education: EDUCATION,
  };
}
