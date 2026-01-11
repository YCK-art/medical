"""
Unit tests for question classification
"""

import sys
import os

# Add parent directory to path to import main
sys.path.insert(0, os.path.dirname(__file__))

from main import classify_question_type


def test_symptom_korean():
    """Test Korean symptom questions"""
    assert classify_question_type("강아지가 토해요", "Korean") == "diagnostic_symptom"
    assert classify_question_type("우리 강아지가 설사해요", "Korean") == "diagnostic_symptom"
    assert classify_question_type("기침을 해요", "Korean") == "diagnostic_symptom"
    assert classify_question_type("아침에 거품토를 했어요", "Korean") == "diagnostic_symptom"
    print("✅ Korean symptom tests passed")


def test_symptom_english():
    """Test English symptom questions"""
    assert classify_question_type("My dog is vomiting", "English") == "diagnostic_symptom"
    assert classify_question_type("My dog has diarrhea", "English") == "diagnostic_symptom"
    assert classify_question_type("My dog is coughing", "English") == "diagnostic_symptom"
    assert classify_question_type("My dog vomited foam this morning", "English") == "diagnostic_symptom"
    print("✅ English symptom tests passed")


def test_symptom_japanese():
    """Test Japanese symptom questions"""
    assert classify_question_type("犬が吐いています", "Japanese") == "diagnostic_symptom"
    assert classify_question_type("下痢をしています", "Japanese") == "diagnostic_symptom"
    assert classify_question_type("咳をしています", "Japanese") == "diagnostic_symptom"
    print("✅ Japanese symptom tests passed")


def test_treatment_korean():
    """Test Korean treatment questions"""
    assert classify_question_type("아토피 치료법은?", "Korean") == "treatment"
    assert classify_question_type("슬개골 탈구 치료는 어떻게 하나요?", "Korean") == "treatment"
    assert classify_question_type("어떤 약물을 사용하나요?", "Korean") == "treatment"
    print("✅ Korean treatment tests passed")


def test_treatment_english():
    """Test English treatment questions"""
    assert classify_question_type("How to treat atopic dermatitis?", "English") == "treatment"
    assert classify_question_type("What is the treatment for patellar luxation?", "English") == "treatment"
    assert classify_question_type("What medication should be used?", "English") == "treatment"
    print("✅ English treatment tests passed")


def test_treatment_japanese():
    """Test Japanese treatment questions"""
    assert classify_question_type("アトピー性皮膚炎の治療は?", "Japanese") == "treatment"
    assert classify_question_type("どんな薬物を使いますか?", "Japanese") == "treatment"
    print("✅ Japanese treatment tests passed")


def test_prognosis_korean():
    """Test Korean prognosis questions"""
    assert classify_question_type("유선종양 예후는?", "Korean") == "prognosis"
    assert classify_question_type("생존율은 어떻게 되나요?", "Korean") == "prognosis"
    assert classify_question_type("얼마나 살 수 있나요?", "Korean") == "prognosis"
    print("✅ Korean prognosis tests passed")


def test_prognosis_english():
    """Test English prognosis questions"""
    assert classify_question_type("What is the prognosis for mammary tumors?", "English") == "prognosis"
    assert classify_question_type("What is the survival rate?", "English") == "prognosis"
    assert classify_question_type("What is the life expectancy?", "English") == "prognosis"
    print("✅ English prognosis tests passed")


def test_prognosis_japanese():
    """Test Japanese prognosis questions"""
    assert classify_question_type("リンパ腫の予後は?", "Japanese") == "prognosis"
    assert classify_question_type("生存率はどのくらいですか?", "Japanese") == "prognosis"
    print("✅ Japanese prognosis tests passed")


def test_diagnostic_disease():
    """Test diagnostic disease questions"""
    assert classify_question_type("What is pancreatitis?", "English") == "diagnostic_disease"
    assert classify_question_type("췌장염이 뭔가요?", "Korean") == "diagnostic_disease"
    assert classify_question_type("膵炎とは何ですか?", "Japanese") == "diagnostic_disease"
    print("✅ Diagnostic disease tests passed")


def test_general():
    """Test general questions"""
    assert classify_question_type("Tell me about veterinary medicine", "English") == "general"
    assert classify_question_type("반려동물에 대해 알려주세요", "Korean") == "general"
    assert classify_question_type("ペットについて教えてください", "Japanese") == "general"
    print("✅ General question tests passed")


def run_all_tests():
    """Run all test functions"""
    print("\n" + "="*60)
    print("Running Question Classification Tests")
    print("="*60 + "\n")

    try:
        test_symptom_korean()
        test_symptom_english()
        test_symptom_japanese()
        test_treatment_korean()
        test_treatment_english()
        test_treatment_japanese()
        test_prognosis_korean()
        test_prognosis_english()
        test_prognosis_japanese()
        test_diagnostic_disease()
        test_general()

        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60 + "\n")
        return True

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
