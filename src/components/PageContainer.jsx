export default function PageContainer({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16 ${className}`} {...props}>
      {children}
    </Tag>
  );
}
