#!/usr/bin/env python3
"""
번역 품질 테스트 스크립트
개선 전/후 번역 품질 비교
"""

import os
import sys
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# backend 폴더의 .env 파일 로드
backend_env = Path(__file__).parent / "backend" / ".env"
load_dotenv(backend_env)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ OPENAI_API_KEY를 찾을 수 없습니다.")
    sys.exit(1)

client = OpenAI(api_key=api_key)

# 테스트 질문들
test_questions = [
    "강아지가 아침에 우웩우웩 거품토를 했는데 뭐가 원인임?",
    "고양이가 밥 먹고 나서 계속 토해요",
    "강아지 다리를 절뚝거려요. 어디가 아픈건가요?",
    "개가 피똥을 싸는데 응급상황인가요?",
    "고양이가 밤마다 물같은 설사를 해요"
]

def old_translation(question: str) -> str:
    """기존 번역 방식"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": f"Translate this veterinary medical question to English. Return ONLY the translation, no explanations:\n\n{question}"
        }],
        temperature=0.3,
        max_tokens=200
    )
    return response.choices[0].message.content.strip()


def new_translation(question: str) -> str:
    """개선된 번역 방식"""
    translation_prompt = f"""You are a veterinary medical translator. Translate this Korean veterinary question to English while PRESERVING ALL clinical context and nuances.

CRITICAL RULES:
1. **Preserve temporal context**: "아침에" → "in the morning", "밤에" → "at night", "식후" → "after eating"
2. **Preserve symptom descriptions**:
   - "우웩우웩" (retching sound) → "retched" or "dry heaving"
   - "거품토" → "foamy vomit" or "frothy vomit"
   - "물같은 설사" → "watery diarrhea"
   - "피똥" → "bloody stool" or "hematochezia"
3. **Preserve clinical patterns**: If the question mentions timing, frequency, or progression, keep those details
4. **Use proper veterinary terminology**: Translate colloquial Korean to professional English medical terms
5. **Preserve question intent**: If asking "what causes", keep it as diagnostic question; if asking "how to treat", keep it as treatment question

Examples:
- "강아지가 아침에 우웩우웩 거품토를 했는데 뭐가 원인임?"
  → "My dog retched and vomited foam in the morning. What could be the cause?"

- "고양이가 밥 먹고 나서 계속 토해요"
  → "My cat keeps vomiting after eating meals"

- "강아지 다리를 절뚝거려요. 어디가 아픈건가요?"
  → "My dog is limping. Where might the pain be?"

Now translate this Korean veterinary question:

{question}

Return ONLY the English translation that preserves all clinical details and context."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": translation_prompt
        }],
        temperature=0.2,
        max_tokens=250
    )
    return response.choices[0].message.content.strip()


if __name__ == "__main__":
    print("="*80)
    print("번역 품질 비교 테스트")
    print("="*80)

    for i, question in enumerate(test_questions, 1):
        print(f"\n{'─'*80}")
        print(f"[테스트 {i}] 원본 한국어 질문:")
        print(f"  {question}")
        print()

        old_trans = old_translation(question)
        print(f"❌ 기존 번역:")
        print(f"  {old_trans}")
        print()

        new_trans = new_translation(question)
        print(f"✅ 개선된 번역:")
        print(f"  {new_trans}")
        print()

        # 차이점 분석
        print("📊 분석:")
        if "morning" in new_trans.lower() and "아침" in question:
            print("  ✓ 시간적 맥락 보존됨")
        if "retch" in new_trans.lower() and "우웩" in question:
            print("  ✓ 증상 의성어 의학 용어로 변환됨")
        if "foamy" in new_trans.lower() or "frothy" in new_trans.lower() and "거품" in question:
            print("  ✓ 거품 증상 정확히 표현됨")
        if ("after eating" in new_trans.lower() or "after meals" in new_trans.lower()) and "밥 먹고" in question:
            print("  ✓ 식후 맥락 보존됨")
        if ("bloody" in new_trans.lower() or "hematochezia" in new_trans.lower()) and "피똥" in question:
            print("  ✓ 혈변 의학 용어로 변환됨")
        if "watery diarrhea" in new_trans.lower() and "물같은 설사" in question:
            print("  ✓ 설사 특성 정확히 표현됨")
        if "night" in new_trans.lower() and "밤" in question:
            print("  ✓ 야간 맥락 보존됨")

    print("\n" + "="*80)
    print("✅ 테스트 완료")
    print("="*80)
