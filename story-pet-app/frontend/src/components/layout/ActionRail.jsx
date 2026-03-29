export default function ActionRail({ actions = [] }) {
  return (
    <aside className="action-rail">
      {actions.map((action) => (
        <button
          key={action.key}
          className="action-rail__btn"
          onClick={action.onClick}
          title={action.label}
          type="button"
        >
          {action.iconText}
        </button>
      ))}
    </aside>
  )
}