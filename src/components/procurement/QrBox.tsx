interface QrBoxProps {
  svg: string
  caption?: string
  sizeMm?: number
  className?: string
}

export function QrBox({
  svg,
  caption = "QR Verifikasi Sah Sistem HIKA",
  sizeMm = 19,
  className = "",
}: QrBoxProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className="qr-box bg-white flex items-center justify-center p-[2mm] rounded-[3px] border border-black/80"
        style={{
          width: `${sizeMm + 4}mm`,
          height: `${sizeMm + 4}mm`,
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption && (
        <span className="text-[6.5pt] font-bold text-center text-black/80 tracking-tight leading-tight">
          {caption}
        </span>
      )}
    </div>
  )
}
