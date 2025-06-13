const getImageBase64 = async (ma_hang) => {
  const baseName = (ma_hang || '').toLowerCase();
  const tryFetch = async (ext) => {
    const url = `${window.location.origin}/image/HangHoa/${baseName}.${ext}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob || blob.type === "text/html") return null;
      return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // Thử jpg trước, nếu không có thì thử png
  return (await tryFetch('jpg')) || (await tryFetch('png'));
};

export default getImageBase64;