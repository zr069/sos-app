import { createClient } from '@/lib/supabase/server'
import { DisclaimerBox } from '@/components/ui/disclaimer-box'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preparedness',
  description: 'Calm and practical preparedness guidance for health emergencies. Supplies, planning and household readiness.',
}

const categories = [
  {
    key: 'hygiene',
    title: 'Hygiene',
    description: 'Soap, hand sanitizer, tissues, waste bags.',
  },
  {
    key: 'masks',
    title: 'Masks',
    description: 'Appropriate respiratory protection for different situations.',
  },
  {
    key: 'gloves',
    title: 'Gloves',
    description: 'Disposable gloves for handling and cleaning.',
  },
  {
    key: 'disinfectants',
    title: 'Disinfectants',
    description: 'Surface disinfectants and cleaning supplies.',
  },
  {
    key: 'drinking_water',
    title: 'Drinking water',
    description: 'Clean drinking water storage for household needs.',
  },
  {
    key: 'food',
    title: 'Shelf-stable food',
    description: 'Non-perishable food items for short-term supply.',
  },
  {
    key: 'first_aid',
    title: 'First aid',
    description: 'Basic first aid kit and wound care supplies.',
  },
  {
    key: 'medicine',
    title: 'Medicine storage',
    description: 'Keeping essential medications organized and accessible.',
  },
  {
    key: 'baby',
    title: 'Baby supplies',
    description: 'Diapers, formula, baby food and essentials for infants.',
  },
  {
    key: 'pets',
    title: 'Pet supplies',
    description: 'Food, medication and care items for pets.',
  },
  {
    key: 'power',
    title: 'Power banks',
    description: 'Portable charging and backup power for devices.',
  },
  {
    key: 'air_filters',
    title: 'Air filters',
    description: 'Air purification for indoor environments.',
  },
  {
    key: 'planning',
    title: 'Household planning',
    description: 'Emergency contacts, household inventory, communication plan.',
  },
]

export default async function PreparednessPage() {
  let products: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('category')

    products = data || []
  } catch {
    // Supabase not configured
  }

  const productsByCategory = products.reduce((acc: Record<string, any[]>, p: any) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Preparedness</h1>
      <p className="text-sm text-slate-500 mb-4">
        Practical guidance for calm and responsible household readiness. These recommendations are general suggestions, not medical advice.
      </p>

      <div className="border border-slate-200 rounded p-4 bg-slate-50 mb-8">
        <p className="text-xs text-slate-500">
          Some links may be affiliate links. This does not influence our health information or outbreak data.
        </p>
      </div>

      <div className="space-y-8">
        {categories.map(cat => (
          <section key={cat.key} id={cat.key}>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">{cat.title}</h2>
            <p className="text-sm text-slate-500 mb-4">{cat.description}</p>

            {productsByCategory[cat.key] && productsByCategory[cat.key].length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {productsByCategory[cat.key].map((product: any) => (
                  <div key={product.id} className="border border-slate-200 rounded p-4">
                    <p className="text-sm font-medium text-slate-900">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-slate-500 mt-1">{product.description}</p>
                    )}
                    {product.affiliate_url && (
                      <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-block text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded px-2 py-1 mt-2"
                      >
                        View product
                      </a>
                    )}
                    {product.disclaimer && (
                      <p className="text-xs text-slate-400 mt-2">{product.disclaimer}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 rounded p-4">
                <p className="text-xs text-slate-400">No product recommendations added yet for this category.</p>
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12">
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium text-slate-700 rounded hover:bg-slate-50 transition-colors"
        >
          Create account for personal checklist
        </Link>
      </div>

      <div className="mt-8">
        <DisclaimerBox text="Preparedness recommendations are general suggestions. They do not replace professional medical advice or official emergency guidance. No product listed here is claimed to prevent infection." />
      </div>
    </div>
  )
}
