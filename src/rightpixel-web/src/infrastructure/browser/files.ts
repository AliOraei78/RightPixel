export const files = {
  download(name: string, data: BlobPart, type: string) {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  async project(session: string) {
    const response = await fetch(
      '/api/curriculum/csharp/workshops/' + encodeURIComponent(session),
      { signal: AbortSignal.timeout(10000) },
    );
    if (!response.ok) throw new Error('پروژه دریافت نشد؛ ارتباط را بررسی و دوباره تلاش کن.');
    return response.blob();
  },
};
