/**
 * Blob, MediaSource 타입의 데이터를 파일로 다운로드합니다.
 * @param blob 다운로드할 데이터
 * @param name 다운로드할 파일 이름
 */
export function downloadBlob(blob: Blob | MediaSource, name: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 지정된 URL의 파일을 다운로드합니다.
 *
 * @param {string} url 파일을 다운로드할 URL
 * @param params HTTP 요청에 전달될 파라미터
 * @param {string} name 파일 이름
 */
async function download(url: string, params?: Record<string, string>, name?: string) {
    const fetchUrl = new URL(url, window.location.href);
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            fetchUrl.searchParams.append(k, v);
        });
    }

    const response = await fetch(fetchUrl.toString());
    const blob = await response.blob();

    let fileName = name;
    if (!fileName) {
        const contentDisposition = response.headers.get('content-disposition');
        const fileNameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
        if (fileNameMatch?.length === 2) {
            fileName = fileNameMatch[1];
        }
    }

    if (!fileName) {
        fileName = url.split('/').pop();
    }

    const decodedFileName = decodeURIComponent(fileName ?? 'downloaded_file');
    downloadBlob(blob, decodedFileName);
}

/**
 * 지정된 URL의 파일을 다운로드합니다.
 * @param {string} url 파일을 다운로드할 URL
 * @param {string} name 파일 이름
 */
export async function downloadURL(url: string, name?: string) {
    await download(url, undefined, name);
}
