type Language = 'English' | '한국어' | '日本語';

export const translations = {
  recording: {
    readyToRecord: {
      'English': 'Ready to Record?',
      '한국어': '녹음 준비 완료?',
      '日本語': '録音準備完了？'
    },
    betaInProgress: {
      'English': 'Beta service is currently in preparation',
      '한국어': '베타 서비스 준비 중입니다',
      '日本語': 'ベータサービス準備中です'
    },
    consentNotice: {
      'English': 'Healthcare providers must obtain patient consent before recording and comply with applicable medical privacy laws and',
      '한국어': '의료진은 녹음 전 환자 동의를 받아야 하며 관할 지역의 의료 개인정보 보호법 및 규정을 준수해야 합니다.',
      '日本語': '医療提供者は録音前に患者の同意を得る必要があり、管轄区域の医療プライバシー法および規制を遵守する必要があります。'
    },
    regulations: {
      'English': 'regulations',
      '한국어': '규정',
      '日本語': '規制'
    }
  },
  processing: {
    title: {
      'English': 'Processing Recording',
      '한국어': '녹음 처리 중',
      '日本語': '録音処理中'
    },
    consentNotice: {
      'English': 'Healthcare providers must obtain patient consent before recording and comply with applicable medical privacy laws and',
      '한국어': '의료진은 녹음 전 환자 동의를 받아야 하며 관할 지역의 의료 개인정보 보호법 및 규정을 준수해야 합니다.',
      '日本語': '医療提供者は録音前に患者の同意を得る必要があり、管轄区域の医療プライバシー法および規制を遵守する必要があります。'
    },
    regulations: {
      'English': 'regulations',
      '한국어': '규정',
      '日本語': '規制'
    },
    steps: {
      transcribing: {
        'English': 'Converting speech to text',
        '한국어': '음성을 텍스트로 변환 중',
        '日本語': '音声をテキストに変換中'
      },
      aligning: {
        'English': 'Aligning timestamps',
        '한국어': '타임스탬프 정렬 중',
        '日本語': 'タイムスタンプ調整中'
      },
      diarizing: {
        'English': 'Identifying speakers',
        '한국어': '화자 식별 중',
        '日本語': '話者識別中'
      },
      finalizing: {
        'English': 'Mapping speaker roles',
        '한국어': '화자 역할 매핑 중',
        '日本語': '話者役割マッピング中'
      }
    }
  }
};

export function getTranslation(key: string, language: Language): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }

  return value[language] || value['English'] || key;
}

export function getFontFamily(language: Language): string {
  if (language === '한국어' || language === '日本語') {
    return 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
  }
  return 'Hedvig Letters Serif, serif';
}
