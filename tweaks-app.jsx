// NAST-BUD — Tweaks app
// Three expressive controls: Paleta, Krój nagłówków, Ziarno.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "czerwien",
  "voice": "brutal",
  "grain": "czysta"
}/*EDITMODE-END*/;

// Palette previews for the TweakColor swatch cards.
// [hero, supporting1, supporting2] — purely visual identity at a glance.
const PALETTE_PREVIEWS = {
  czerwien:  ["#E1251B", "#0A0A0A", "#F4F2EE"],
  beton:     ["#3A332C", "#1A1816", "#ECE8E1"],
  blueprint: ["#1F5FBE", "#0F1F3A", "#ECF1F8"],
  hivis:     ["#FFB400", "#0A0A0A", "#F4F2EE"],
};
const PALETTE_KEY_BY_HERO = Object.fromEntries(
  Object.entries(PALETTE_PREVIEWS).map(([k, v]) => [v[0].toLowerCase(), k])
);

function NastTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const html = document.documentElement;
    html.dataset.palette = t.palette;
    html.dataset.voice = t.voice;
    html.dataset.grain = t.grain;
  }, [t.palette, t.voice, t.grain]);

  // We let TweakColor compare arrays; map the chosen array back to a key.
  const onPalette = (arr) => {
    const key = PALETTE_KEY_BY_HERO[String(arr[0]).toLowerCase()] || "czerwien";
    setTweak("palette", key);
  };

  return (
    <TweaksPanel title="NAST-BUD · Tweaks">
      <TweakSection label="Paleta" />
      <TweakColor
        label="Identyfikacja"
        value={PALETTE_PREVIEWS[t.palette] || PALETTE_PREVIEWS.czerwien}
        options={[
          PALETTE_PREVIEWS.czerwien,
          PALETTE_PREVIEWS.beton,
          PALETTE_PREVIEWS.blueprint,
          PALETTE_PREVIEWS.hivis,
        ]}
        onChange={onPalette}
      />

      <TweakSection label="Krój nagłówków" />
      <TweakRadio
        label="Głos"
        value={t.voice}
        options={[
          { value: "brutal",    label: "Brutal"    },
          { value: "stencil",   label: "Stencil"   },
          { value: "editorial", label: "Editorial" },
        ]}
        onChange={(v) => setTweak("voice", v)}
      />

      <TweakSection label="Ziarno" />
      <TweakRadio
        label="Powierzchnia"
        value={t.grain}
        options={[
          { value: "czysta", label: "Czysta" },
          { value: "print",  label: "Druk"   },
          { value: "dust",   label: "Pył"    },
        ]}
        onChange={(v) => setTweak("grain", v)}
      />
    </TweaksPanel>
  );
}

const __root = document.getElementById("tweaks-root");
if (__root) ReactDOM.createRoot(__root).render(<NastTweaks />);
