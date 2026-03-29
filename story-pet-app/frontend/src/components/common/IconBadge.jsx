export default function IconBadge({
  text = '狐',
  tone = 'moss',
  size = 42,
  rounded = '16px',
}) {
  const safeText = String(text || '狐').slice(0, 2)

  return (
    <span
      className={`icon-badge icon-badge--${tone}`}
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        fontSize: size * 0.4,
      }}
      title={safeText}
    >
      {safeText}
    </span>
  )
}