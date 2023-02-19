import React from "react";
import { useRouter } from "next/router";

export default function AnchorLink({
  children,
  href,
}) {
  const router = useRouter();
  return (
    <a href={href} className='text-decoration-none'>
      <span className={router.asPath === href ? `active ` : "inactive"}>
        {children}
      </span>
    </a>
  );
}


