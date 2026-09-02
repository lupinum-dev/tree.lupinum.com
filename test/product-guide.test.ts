import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ProductGuide from '../src/components/ProductGuide.vue'

describe('product guide', () => {
  it('explains the README workflow, formats, privacy, and product links', async () => {
    const wrapper = mount(ProductGuide)

    expect(wrapper.get('h1').text()).toBe('Add a folder tree to your README')
    expect(wrapper.findAll('ol li')).toHaveLength(3)
    const accordionTriggers = wrapper.findAll('[data-reka-collection-item]')
    expect(accordionTriggers).toHaveLength(4)
    expect(wrapper.text()).toContain('Choose ASCII or Unicode')
    expect(wrapper.text()).toContain('Your folder stays on your device')
    expect(wrapper.find('a[href="/"][aria-current]').exists()).toBe(false)
    expect(wrapper.get('a[href="/guide/"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('a[href="https://lupinum.com/datenschutz"]').text()).toBe('Privacy')
    expect(
      wrapper.get('a[href="https://gitlab.com/nfriend/tree-online"]').attributes('rel'),
    ).toContain('noopener')
    expect(wrapper.get('svg[viewBox="0 0 24 24"]')).toBeDefined()
    expect(
      wrapper.get('a[href="https://github.com/lupinum-dev/lupinum-tree"]').attributes('rel'),
    ).toContain('noopener')

    await wrapper.get<HTMLTextAreaElement>('#guide-tree-source').setValue(`project
  src
    main.ts`)
    expect(wrapper.text()).toContain('main.ts')

    await accordionTriggers[0]!.trigger('click')
    expect(accordionTriggers[0]!.attributes('data-state')).toBe('open')
    expect(wrapper.text()).toContain('An ASCII tree is a plain-text view of a hierarchy.')
  })
})
