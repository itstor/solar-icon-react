import * as React from "react";

export interface IconTree {
  tag: string;
  attr: {
    [key: string]: string;
  };
  child: IconTree[];
}

export function GenIcon(
  data: IconTree
): (props: IconBaseProps) => React.JSX.Element {
  return (props: IconBaseProps) => (
    <IconBase attr={{ ...data.attr }} {...props}>
      {generateIcon(data.child)}
    </IconBase>
  );
}

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  size?: string | number;
  color?: string;
  title?: string;
}

export type IconType = (props: IconBaseProps) => JSX.Element;

export function IconBase(
  props: IconBaseProps & { attr?: Record<string, string> }
): JSX.Element {
  const { attr, size, title, className, ...svgProps } = props;
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      {...attr}
      {...svgProps}
      className={className}
      height={size || "1em"}
      width={size || "1em"}
      style={{
        ...svgProps.style,
      }}
    >
      {title && <title>{title}</title>}
      {props.children}
    </svg>
  );
}

function generateIcon(iconTree: IconTree[]): React.ReactNode {
  return iconTree.map((node, i) => {
    if (node.tag === "svg")
      return node.child.map((child) => generateIcon([child]));
    return React.createElement(
      node.tag,
      { key: i, ...node.attr },
      node.child.length > 0 ? generateIcon(node.child) : null
    );
  });
}
