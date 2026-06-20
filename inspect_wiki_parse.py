with open('../kickoff-2026-api/wc26_api_implementation_plan.md', 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if 'seed' in line.lower() or 'fixture' in line.lower() or 'backfill' in line.lower():
            print(f"{idx}: {line.strip()}")
