"use client";

import { useEffect, useState } from "react";
import { variants } from "@/lib/content";

const evalVariants = variants.filter((x) => !x.slug.startsWith("s30"));

type VEval = { score: number; likes: string; dislikes: string };
type Final = { option: string; base: string; note: string };
type Data = { v: Record<string, VEval>; final: Final };

const OPTIONS = [
  { id: "A", label: "1개로 통합 (베이스 + 베스트 섹션 이식)" },
  { id: "B", label: "2개로 압축 (다크 1 + 라이트 1)" },
  { id: "C", label: "5개 유지 + 스택 효과만 공통 적용" },
  { id: "D", label: "기타 (메모에 작성)" },
];

const KEY = "arise-eval-v1";

function emptyData(): Data {
  const v: Record<string, VEval> = {};
  evalVariants.forEach((x) => (v[x.slug] = { score: 0, likes: "", dislikes: "" }));
  return { v, final: { option: "", base: "", note: "" } };
}

export default function Evaluate() {
  const [data, setData] = useState<Data>(emptyData);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Data>;
        const base = emptyData();
        setData({
          v: { ...base.v, ...(parsed.v ?? {}) },
          final: { ...base.final, ...(parsed.final ?? {}) },
        });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  // auto-save
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full / blocked */
    }
  }, [data, loaded]);

  function setV(slug: string, patch: Partial<VEval>) {
    setData((d) => ({ ...d, v: { ...d.v, [slug]: { ...d.v[slug], ...patch } } }));
  }
  function setFinal(patch: Partial<Final>) {
    setData((d) => ({ ...d, final: { ...d.final, ...patch } }));
  }

  function buildSummary(): string {
    const lines: string[] = ["# ARISE PNU 시안 평가 결과", ""];
    evalVariants.forEach((x) => {
      const e = data.v[x.slug];
      if (e) {
        lines.push(`## ${x.name} (${x.vibe})`);
        lines.push(`- 점수: ${e.score ? `${e.score}/5` : "–"}`);
        lines.push(`- 좋은 점: ${e.likes.trim() || "–"}`);
        lines.push(`- 아쉬운 점: ${e.dislikes.trim() || "–"}`);
        lines.push("");
      }
    });
    const opt = OPTIONS.find((o) => o.id === data.final.option);
    lines.push("## 최종 결정");
    lines.push(`- 방향: ${opt ? `${opt.id}. ${opt.label}` : "–"}`);
    lines.push(`- 베이스 시안: ${data.final.base.trim() || "–"}`);
    lines.push(`- 메모: ${data.final.note.trim() || "–"}`);
    return lines.join("\n");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  function reset() {
    if (confirm("입력한 평가를 모두 지울까요?")) setData(emptyData());
  }

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-[820px] bg-[#0b0b0c] px-5 py-12 text-[#ededed] md:px-8 md:py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          시안 평가
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          각 시안을 새 탭에서 보고, 점수와 좋은 점·아쉬운 점만 적어주세요. 입력은
          자동 저장됩니다. 다 적으면 아래 <b>결과 복사</b>로 한 번에 가져갈 수 있어요.
        </p>
      </header>

      <ol className="space-y-5">
        {evalVariants.map((x, i) => {
          const e = data.v[x.slug] || { score: 0, likes: "", dislikes: "" };
          return (
            <li
              key={x.slug}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full ring-2 ring-white/15"
                    style={{ background: x.accent }}
                  />
                  <div>
                    <div className="font-bold leading-tight">
                      {String(i + 1).padStart(2, "0")} · {x.name}
                    </div>
                    <div className="text-xs text-white/45">{x.vibe}</div>
                  </div>
                </div>
                <a
                  href={`/${x.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-white/50"
                  style={{ color: x.accent }}
                >
                  시안 보기 ↗
                </a>
              </div>

              {/* score */}
              <div className="mt-4 flex items-center gap-2">
                <span className="mr-1 text-xs text-white/45">점수</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setV(x.slug, { score: e.score === n ? 0 : n })}
                    aria-label={`${n}점`}
                    className="h-7 w-7 rounded-full border text-sm font-semibold transition-colors"
                    style={{
                      borderColor: n <= e.score ? x.accent : "rgba(255,255,255,0.18)",
                      background: n <= e.score ? x.accent : "transparent",
                      color: n <= e.score ? "#0b0b0c" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* likes / dislikes */}
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-emerald-300/80">
                    👍 좋은 점
                  </span>
                  <textarea
                    value={e.likes}
                    onChange={(ev) => setV(x.slug, { likes: ev.target.value })}
                    rows={3}
                    placeholder="마음에 든 부분…"
                    className="w-full resize-y rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-white/35"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-rose-300/80">
                    👎 아쉬운 점
                  </span>
                  <textarea
                    value={e.dislikes}
                    onChange={(ev) => setV(x.slug, { dislikes: ev.target.value })}
                    rows={3}
                    placeholder="고쳤으면 하는 부분…"
                    className="w-full resize-y rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-white/35"
                  />
                </label>
              </div>
            </li>
          );
        })}
      </ol>

      {/* final decision */}
      <section className="mt-8 rounded-2xl border border-white/15 bg-white/[0.04] p-5 md:p-6">
        <h2 className="text-lg font-bold">최종 결정 (합쳐서 줄이기)</h2>
        <div className="mt-4 space-y-2">
          {OPTIONS.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors"
              style={{
                borderColor:
                  data.final.option === o.id
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(255,255,255,0.12)",
                background:
                  data.final.option === o.id ? "rgba(255,255,255,0.06)" : "transparent",
              }}
            >
              <input
                type="radio"
                name="final-option"
                checked={data.final.option === o.id}
                onChange={() => setFinal({ option: o.id })}
                className="accent-white"
              />
              <span>
                <b>{o.id}.</b> {o.label}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/55">
              베이스 시안 (뼈대로 삼을 것)
            </span>
            <input
              value={data.final.base}
              onChange={(ev) => setFinal({ base: ev.target.value })}
              placeholder="예: tresmares"
              className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-white/35"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/55">
              메모 (이식할 요소 / 버릴 것 등)
            </span>
            <input
              value={data.final.note}
              onChange={(ev) => setFinal({ note: ev.target.value })}
              placeholder="예: Hero는 yale, 로드맵 모션은 cura"
              className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-white/35"
            />
          </label>
        </div>
      </section>

      {/* actions */}
      <div className="sticky bottom-4 mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-white/12 bg-black/70 p-3 backdrop-blur">
        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform active:scale-95"
        >
          {copied ? "복사됨 ✓" : "결과 복사"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/40"
        >
          초기화
        </button>
        <span className="ml-auto text-xs text-white/40">자동 저장됨 · 결과 복사 후 채팅에 붙여주세요</span>
      </div>
    </main>
  );
}
