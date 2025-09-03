import HeroSection from "@/components/hero-section";



export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-4 py-10 ">
        <section className="flex flex-col gap-4">
          <HeroSection />
        </section>

        {/* <section className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-light">Produk Terbaru</h2>
              <p className="text-sm text-muted-foreground font-light">
                Temukan produk terbaru dari berbagai kategori
              </p>
            </div>
          </div>
          <ProductList gridCols="scroll" isPaginated={false} sortBy="latest" />
        </section> */}

        {/* <section className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-light">Produk Terpopuler</h2>
              <p className="text-sm text-muted-foreground font-light">
                Temukan produk terpopuler dari berbagai kategori
              </p>
            </div>
          </div>
          <ProductList
            gridCols="scroll"
            isPaginated={false}
            sortBy="trending"
          />
        </section> */}

      </div>
    </>
  );
}
