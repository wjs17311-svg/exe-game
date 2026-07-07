import { put } from '@vercel/blob';

// 이미지 파일은 용량이 크므로 Vercel의 기본 제한을 10MB로 늘려줍니다.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // POST 요청이 아니면 거절합니다.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, filename } = req.body;

    // 프론트엔드가 보낸 base64 이미지 데이터에서 불필요한 앞부분 제거
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    // 컴퓨터가 이해할 수 있는 이진 파일(Buffer)로 변환
    const buffer = Buffer.from(base64Data, 'base64');

    // 🌟 Vercel Blob 창고에 파일 업로드 실행!
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png'
    });

    // 업로드가 성공하면 저장된 이미지의 고유 인터넷 주소(URL)를 돌려줍니다.
    return res.status(200).json({ success: true, url: blob.url });
  } catch (error) {
    console.error("업로드 에러:", error);
    return res.status(500).json({ error: error.message });
  }
}