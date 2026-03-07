import React from "react";
import { Link } from "react-router-dom";

type NextLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
};

export default function NextLink({ href, children, ...rest }: NextLinkProps) {
  return (
    <Link to={href} {...rest}>
      {children}
    </Link>
  );
}
