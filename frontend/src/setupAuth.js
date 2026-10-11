// Automatically attach Bearer token and credentials to backend requests
const originalFetch = window.fetch;

window.fetch = function (resource, init) {
  try {
    const token = localStorage.getItem("auth_token");
    let url = "";

    if (typeof resource === "string") {
      url = resource;
    } else if (resource instanceof URL) {
      url = resource.href;
    } else if (resource && typeof resource.url === "string") {
      url = resource.url;
    }

    const isBackend =
      url &&
      (url.includes("souschef-backend") ||
        url.includes(":5555") ||
        url.startsWith("/api") ||
        url.includes("/api/"));

    if (isBackend) {
      init = init ? { ...init } : {};

      // Normalize headers to Headers instance
      let headers;
      if (init.headers instanceof Headers) {
        headers = new Headers(init.headers);
      } else if (init.headers) {
        headers = new Headers(init.headers);
      } else if (resource instanceof Request && resource.headers) {
        headers = new Headers(resource.headers);
      } else {
        headers = new Headers();
      }

      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      init.headers = headers;

      // Ensure credentials include for backend calls if not explicitly set
      if (!init.credentials) {
        init.credentials = "include";
      }
    }
  } catch (err) {
    console.error("Error setting auth headers in fetch:", err);
  }

  return originalFetch.call(this, resource, init);
};
