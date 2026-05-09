import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-14">{children}</main>
      <Footer />
    </>
  )
}
