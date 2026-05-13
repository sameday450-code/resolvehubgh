import { motion } from 'framer-motion';
import { fadeUp, defaultViewport } from '../../lib/animations';

/**
 * RevealOnScroll — wraps any content with a fade-up scroll reveal.
 *
 * Props:
 *  - variants  — override the default fadeUp variant
 *  - viewport  — override the default viewport config
 *  - delay     — seconds to delay the animation start (default 0)
 *  - className — forwarded to the inner motion.div
 *  - as        — rendered HTML tag (default 'div')
 *  - children  — content to reveal
 */
export default function RevealOnScroll({
  children,
  variants = fadeUp,
  viewport = defaultViewport,
  delay = 0,
  className = '',
  as = 'div',
}) {
  const Tag = motion[as] || motion.div;

  const variantsWithDelay =
    delay > 0
      ? {
          ...variants,
          visible: {
            ...variants.visible,
            transition: {
              ...(variants.visible?.transition ?? {}),
              delay,
            },
          },
        }
      : variants;

  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variantsWithDelay}
      className={className}
    >
      {children}
    </Tag>
  );
}
