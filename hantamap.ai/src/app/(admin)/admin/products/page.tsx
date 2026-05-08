import { createClient } from '@/lib/supabase/server'
import { ProductForm } from './product-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Products' }

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('category')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Products</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Add product</h2>
          <ProductForm />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Existing products</h2>
          {products && products.length > 0 ? (
            <div className="space-y-2">
              {products.map((p: any) => (
                <div key={p.id} className="border border-slate-200 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.category}</p>
                    </div>
                    <span className={`text-xs ${p.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No products added yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
