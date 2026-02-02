"use client";

export default function FeedbackButton() {
  return (
    <div className="fixed bottom-6 right-6 flex items-end gap-3 z-50">
      <div className="bg-white border-2 border-indigo-600 px-3 py-2 rounded-xl shadow-lg relative mb-1 hidden sm:block">
        <p className="text-xs font-bold text-gray-700 whitespace-nowrap">
          ご意見・ご感想はこちら
        </p>
        {/* 吹き出しのしっぽ */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 border-l-[8px] border-l-indigo-600 border-y-[6px] border-y-transparent" />
        <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 border-l-[7px] border-l-white border-y-[5px] border-y-transparent" />
      </div>

      <a
        href="https://x.com/intent/post?text=%40ebiudk"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center group"
        aria-label="Xでフィードバックを送る"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-6 w-6 fill-current"
        >
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z"></path>
        </svg>
      </a>
    </div>
  );
}
