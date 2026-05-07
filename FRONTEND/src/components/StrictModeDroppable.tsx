import { useEffect, useState } from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

/**
 * Workaround for react-beautiful-dnd incompatibility with React 18 StrictMode.
 * Defers rendering until after the first animation frame so the library's
 * internal state is correctly initialised.
 * See: https://github.com/atlassian/react-beautiful-dnd/issues/2399
 */
export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(frame);
      setEnabled(false);
    };
  }, []);

  if (!enabled) return null;

  return <Droppable {...props}>{children}</Droppable>;
};
