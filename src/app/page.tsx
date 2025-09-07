"use client";

import React from "react";

import Link from "next/link";
import HeroSection from "@/components/hero-section";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ProductList from "@/components/product-list";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-4 py-10 ">

        <section className="flex flex-col gap-4">
          <HeroSection />
        </section>

        <section className="flex flex-col container mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <div >
              <h2 className="text-2xl font-light">Produk Terbaru</h2>
              <p className="text-sm text-muted-foreground font-light">
                Temukan produk terbaru
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="hidden sm:flex">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <ProductList sortBy="latest" limit={8} />

          <div className="mt-6 text-center sm:hidden">
            <Link href="/products">
              <Button variant="outline">
                Lihat Semua Produk
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="flex flex-col  container mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-light">Produk Terpopuler</h2>
              <p className="text-sm text-muted-foreground font-light">
                Temukan produk terpopuler dari berbagai kategori
              </p>
            </div>
            <Link href="/products?sortBy=name&sortOrder=asc">
              <Button variant="outline" className="hidden sm:flex">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <ProductList sortBy="popular" limit={8} />

          <div className="mt-6 text-center sm:hidden">
            <Link href="/products?sortBy=name&sortOrder=asc">
              <Button variant="outline">
                Lihat Semua Produk Populer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
