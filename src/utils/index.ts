// 文件转base64链接
export const file2base64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

// 计算缩放比例
export const calc_scale = (
  width: number,
  height: number,
  max_width: number,
  max_height: number
) => Math.min(max_width / width, max_height / height);

// 复制文字
export const copy_text = (text: string) =>
  navigator.clipboard.writeText(text);
