const SCRIPT_URL = "https://js.paystack.co/v2/inline.js";

let loading = null;

export function loadPaystack() {
  if (window.PaystackPop) return Promise.resolve(window.PaystackPop);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.PaystackPop ? resolve(window.PaystackPop) : reject(new Error("Paystack unavailable")));
    script.onerror = () => {
      script.remove();
      loading = null;
      reject(new Error("Paystack unavailable"));
    };
    document.head.appendChild(script);
  });

  return loading;
}
