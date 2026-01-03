"""
Pinecone에서 고유 논문 목록 추출 (PMCID, DOI, 제목 기준)
"""
import os
from dotenv import load_dotenv
from pinecone import Pinecone
from collections import defaultdict
import json

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

print("🔍 Pinecone에서 고유 논문 추출 중...\n")

# 더미 쿼리로 샘플링
dummy_vector = [0.1] * 1536
results = index.query(
    vector=dummy_vector,
    top_k=10000,
    include_metadata=True
)

# 논문별로 그룹화 (PMCID 또는 DOI 또는 title 기준)
papers = {}

for match in results.matches:
    meta = match.metadata
    pmcid = meta.get("pmcid", "")
    doi = meta.get("doi", "")
    title = meta.get("title", "")
    journal = meta.get("journal", "")

    # 고유 ID 생성
    paper_id = pmcid if pmcid else (doi if doi else title)

    if paper_id and paper_id not in papers:
        papers[paper_id] = {
            "pmcid": pmcid,
            "doi": doi,
            "title": title,
            "journal": journal,
            "pmid": meta.get("pmid", ""),
            "year": meta.get("year", ""),
            "authors": meta.get("authors", "")
        }

print(f"✅ 고유 논문: {len(papers)}개")
print()

# 저널별 통계
journal_counts = defaultdict(int)
for paper in papers.values():
    journal = paper.get("journal", "Unknown")
    journal_counts[journal] += 1

print("="*80)
print("📚 저널별 논문 수 (상위 20개)")
print("="*80)
for journal, count in sorted(journal_counts.items(), key=lambda x: x[1], reverse=True)[:20]:
    print(f"{count:4,} papers | {journal}")
print()

# CSV로 저장 (라이선스 수동 입력용)
output_csv = "/Users/ksinfosys/medical/data-pipeline/unique_papers_for_license_check.csv"
with open(output_csv, 'w', encoding='utf-8') as f:
    f.write("pmcid,doi,title,journal,year,license,notes\n")
    for paper_id, paper in sorted(papers.items()):
        pmcid = paper.get("pmcid", "")
        doi = paper.get("doi", "")
        title = paper.get("title", "").replace('"', '""')  # CSV escape
        journal = paper.get("journal", "").replace('"', '""')
        year = paper.get("year", "")

        f.write(f'"{pmcid}","{doi}","{title}","{journal}","{year}","",\n')

print(f"💾 CSV 저장: {output_csv}")
print(f"   ({len(papers)}개 논문)")
print()

# JSON으로도 저장
output_json = "/Users/ksinfosys/medical/data-pipeline/unique_papers.json"
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump({
        "total_papers": len(papers),
        "papers": papers
    }, f, indent=2, ensure_ascii=False)

print(f"💾 JSON 저장: {output_json}")
print()

# PMC 논문만 따로 추출 (라이선스 조회 가능)
pmc_papers = {pid: p for pid, p in papers.items() if p.get("pmcid")}
print(f"📄 PMC 논문: {len(pmc_papers)}개 (전체의 {len(pmc_papers)/len(papers)*100:.1f}%)")
print(f"❓ 비-PMC 논문: {len(papers) - len(pmc_papers)}개")
