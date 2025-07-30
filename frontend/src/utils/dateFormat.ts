export const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    console.log("math "+match)
  return match ? decodeURIComponent(match[2]) : null;
};