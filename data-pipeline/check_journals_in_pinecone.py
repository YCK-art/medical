"""
Pinecone DB에 저장된 모든 저널 목록 추출
"""
import os
from dotenv import load_dotenv
from pinecone import Pinecone
from collections import Counter
import json

load_dotenv()

# Pinecone 클라이언트 초기화
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")

# 인덱스 통계 확인
stats = index.describe_index_stats()
print(f"📊 Total vectors in index: {stats.total_vector_count:,}")
print(f"📊 Namespaces: {stats.namespaces}")
print()

# 샘플 벡터들을 가져와서 저널 정보 수집
print("🔍 Fetching sample vectors to identify journals...")

# Pinecone에서 랜덤 샘플링 (쿼리로 여러 번 호출)
journals = []
sample_size = 1000  # 샘플 크기

# 더미 쿼리로 샘플 가져오기
# (완전 랜덤은 아니지만 다양한 벡터를 확인 가능)
try:
    # 더미 벡터로 쿼리 (1536 차원)
    dummy_vector = [0.1] * 1536

    results = index.query(
        vector=dummy_vector,
        top_k=10000,  # 최대한 많이 가져오기
        include_metadata=True
    )

    for match in results.matches:
        metadata = match.metadata
        journal = metadata.get("journal", "Unknown")
        if journal and journal != "Unknown":
            journals.append(journal)

    print(f"✅ Fetched {len(journals)} vectors with journal metadata")
    print()

    # 저널별 카운트
    journal_counts = Counter(journals)

    print(f"📚 Unique journals found: {len(journal_counts)}")
    print()
    print("="*80)
    print("JOURNAL LIST (sorted by document count)")
    print("="*80)

    for journal, count in journal_counts.most_common():
        print(f"{count:6,} chunks | {journal}")

    # JSON으로 저장
    journal_list = {
        "total_unique_journals": len(journal_counts),
        "total_chunks_analyzed": len(journals),
        "journals": {
            journal: count for journal, count in journal_counts.items()
        }
    }

    output_file = "/Users/ksinfosys/medical/data-pipeline/pinecone_journals_list.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(journal_list, f, indent=2, ensure_ascii=False)

    print()
    print(f"💾 Journal list saved to: {output_file}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
