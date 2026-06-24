export function DisclaimerBanner() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <strong className="font-semibold">For research and informational purposes only.</strong>{" "}
      Not medical advice and not for human consumption. These tools are calculators — verify all
      figures independently before acting on them.
    </div>
  );
}

export function DisclaimerFooter() {
  return (
    <p className="text-xs leading-relaxed text-slate-500">
      peptideutils.com provides general information and calculation tools for research use only.
      Nothing here is medical advice, a recommendation, or an endorsement of any substance. Always
      consult a qualified professional and follow applicable laws.
    </p>
  );
}
