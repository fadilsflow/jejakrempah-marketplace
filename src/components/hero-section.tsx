import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
    return (
        <>
            <main className="overflow-hidden">
                <section>
                    <div className="relative pt-5 ">
                        <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="sm:mx-auto lg:mr-auto lg:mt-0 flex flex-col">
                                <p className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-10">
                                    Marketplace Jejak  <span className='text-primary'>Rempah Nusantara</span>
                                </p>
                                <p className="mt-8 max-w-2xl text-pretty text-lg">
                                    Menyusuri Warisan Budaya dan Petualangan Aromatik di Jalan Rempah-Rempah
                                </p>
                                <div
                                    className="mt-12 flex flex-col items-start justify-start gap-2 md:flex-row">
                                    <Button
                                        size={"lg"}
                                        asChild>
                                        <Link href="/login" className="flex items-center gap-2">
                                            Eksplore Jalur Rempah
                                        </Link>
                                    </Button>

                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main >
        </>
    )
}


