import { NextRequest, NextResponse } from "next/server";

export function middleware(req:NextRequest){

    const session=req.cookies.get("session");

    if(!session && req.nextUrl.pathname!=="/login"){

        return NextResponse.redirect(new URL("/login",req.url));

    }

    if(session && req.nextUrl.pathname==="/login"){

        return NextResponse.redirect(new URL("/",req.url));

    }

    return NextResponse.next();

}

export const config={

    matcher:[
        "/",
        "/login"
    ]

}