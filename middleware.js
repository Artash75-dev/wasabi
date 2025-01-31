import { NextResponse } from "next/server";

export function middleware(request) {
  const url = new URL(request.url);
  const cookies = request.cookies;
  const authCookies = cookies.get("auth");
  const extraTimeCookie = cookies.get("extraTime");

  if (!authCookies) {
    if (url.pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    // Check if extraTime exists and if it has expired
    if (extraTimeCookie) {
      const extraTime = new Date(extraTimeCookie.value).getTime();
      const currentTime = Date.now();

      // If the current time is greater than extraTime, delete the cookie and redirect to login
      if (currentTime > extraTime) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("auth");
        response.cookies.delete("extraTime");
        return response;
      }
    }

    const { role } = JSON.parse(authCookies.value);

    // Redirect logic based on role
    if (url.pathname === "/login") {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (role === "delivery") {
        return NextResponse.redirect(new URL("/delivery", request.url));
      }
      return NextResponse.next();
    }

    if (url.pathname === "/") {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (role === "delivery") {
        return NextResponse.redirect(new URL("/delivery", request.url));
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    if (url.pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (url.pathname.startsWith("/delivery") && role !== "delivery") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth");
    response.cookies.delete("extraTime");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/delivery/:path*", "/"],
};
