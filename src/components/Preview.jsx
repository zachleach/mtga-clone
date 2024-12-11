export const Preview = ({ position, image }) => {
  return (
    <img
      src={image || ''}
      alt="preview"
      style={{
        ...preview,
        left: position || 0,
        opacity: position ? 1 : 0
      }}
    />
  );
};
