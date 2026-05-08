interface DisclaimerBoxProps {
  text: string
}

export function DisclaimerBox({ text }: DisclaimerBoxProps) {
  return (
    <div className="border border-slate-200 rounded p-4 bg-slate-50">
      <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
    </div>
  )
}
