concurrently -n APP,GO,PY,STRIPE -c green,blue,magenta,cyan \
  "(cd ./nextjs-app && npm run dev)" \
  "(cd ./backend/go && air)" \
  "(cd ./backend/python && OMP_NUM_THREADS=4 MKL_NUM_THREADS=4 TOKENIZERS_PARALLELISM=true ./.venv/bin/gunicorn \
  --bind 0.0.0.0:5000 --workers 1 --threads 1 --timeout 180 --access-logfile - score_resume:app)" \
  "stripe listen --forward-to localhost:8080/webhook"