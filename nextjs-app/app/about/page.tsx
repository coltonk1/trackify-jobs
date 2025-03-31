import Head from "next/head";

const About = () => {
    return (
        <>
            <Head>
                <title>About Page</title>
                <meta name="description" content="A brief description of your page's content." />
            </Head>

            <div className="flex h-full flex-1 flex-col items-center justify-center">
                <p className="mt-4 text-lg text-blue-500">
                    {"This is the About page. Here, you'd find information about our company/project."}
                </p>
            </div>
        </>
    );
};

export default About;
