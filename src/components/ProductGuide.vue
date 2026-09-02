<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  FolderTree,
  LockKeyhole,
} from '@lucide/vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'reka-ui'
import GitHubIcon from '@/components/GitHubIcon.vue'
import GuideTreeDemo from '@/components/GuideTreeDemo.vue'

const faqs = [
  {
    question: 'What is an ASCII tree?',
    answer:
      'An ASCII tree is a plain-text view of a hierarchy. Branch characters show how files and folders are nested. You can use the result in README files, documentation, code comments, issues, and chats.',
  },
  {
    question: 'What is the difference between ASCII and Unicode output?',
    answer:
      'Plain ASCII uses characters such as |, +, and -. Unicode uses box-drawing characters such as │, ├, and └. Use ASCII for older systems. Use Unicode for clearer output in modern editors and Markdown.',
  },
  {
    question: 'Does Lupinum Tree upload my files?',
    answer:
      'No. Folder import reads file and folder names in your browser. It does not read file contents or send the tree to a server. Saved trees stay in this browser.',
  },
  {
    question: 'Can I edit the result before I copy it?',
    answer:
      'Yes. Edit the indented source in the workbench. Lupinum Tree updates the output as you type. You can also change the output format and path settings.',
  },
]
</script>

<template>
  <div class="min-h-svh bg-background">
    <header class="sticky top-0 z-30 border-b bg-background/92 backdrop-blur-xl">
      <div
        class="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-5 py-3 sm:flex-nowrap sm:px-8"
      >
        <a href="/" class="flex min-w-0 items-center gap-2.5 text-foreground no-underline">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs"
          >
            <FolderTree class="size-4" aria-hidden="true" />
          </span>
          <span class="min-w-0 leading-tight">
            <span class="block truncate text-sm font-semibold tracking-[-0.01em]"
              >Lupinum Tree</span
            >
            <span class="hidden text-[11px] text-muted-foreground sm:block">by Lupinum</span>
          </span>
        </a>

        <nav
          class="order-3 grid w-full grid-cols-2 rounded-lg bg-muted p-1 sm:order-none sm:ml-auto sm:w-56"
          aria-label="Primary"
        >
          <a
            href="/"
            class="flex min-h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground no-underline transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
          >
            Workbench
          </a>
          <a
            href="/guide/"
            aria-current="page"
            class="flex min-h-8 items-center justify-center rounded-md bg-card px-3 text-xs font-medium text-foreground no-underline shadow-xs"
          >
            Guide
          </a>
        </nav>

        <a
          href="https://github.com/lupinum-dev/lupinum-tree"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-auto grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 sm:ml-0"
          aria-label="View source on GitHub"
        >
          <GitHubIcon class="size-4" />
        </a>
        <a
          href="https://lupinum.com"
          class="hidden h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground focus-visible:outline-2 md:inline-flex"
        >
          Lupinum
          <ArrowUpRight class="size-3" aria-hidden="true" />
        </a>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <article class="divide-y border-b">
        <header class="pb-10 sm:pb-12">
          <h1
            class="max-w-[18ch] text-balance text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl"
          >
            Add a folder tree to your README
          </h1>
          <p class="mt-5 max-w-[65ch] text-pretty text-base leading-7 text-muted-foreground">
            A directory tree shows how files and folders are organized. Create one from indented
            source or a local folder, then paste the output into a Markdown code block.
          </p>
          <a
            href="/"
            class="mt-7 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Open the workbench
            <ArrowRight class="size-4" aria-hidden="true" />
          </a>
        </header>

        <section class="py-10 sm:py-12" aria-labelledby="example-heading">
          <h2 id="example-heading" class="text-2xl font-semibold tracking-[-0.025em]">
            Turn indented source into a tree
          </h2>
          <p class="mt-3 max-w-[65ch] leading-7 text-muted-foreground">
            Edit the source below. The same parser and formatter used by the workbench create the
            result.
          </p>
          <GuideTreeDemo />
        </section>

        <section class="py-10 sm:py-12" aria-labelledby="steps-heading">
          <h2 id="steps-heading" class="text-2xl font-semibold tracking-[-0.025em]">
            Create README-ready output
          </h2>
          <ol class="mt-7 divide-y">
            <li class="grid gap-2 py-5 sm:grid-cols-[2rem_1fr] sm:gap-4">
              <span class="font-mono text-xs font-medium text-primary" aria-hidden="true">1</span>
              <div>
                <h3 class="font-semibold">Add the structure</h3>
                <p class="mt-2 leading-6 text-muted-foreground">
                  Write or paste indented source. You can also choose a local folder.
                </p>
              </div>
            </li>
            <li class="grid gap-2 py-5 sm:grid-cols-[2rem_1fr] sm:gap-4">
              <span class="font-mono text-xs font-medium text-primary" aria-hidden="true">2</span>
              <div>
                <h3 class="font-semibold">Choose the output</h3>
                <p class="mt-2 leading-6 text-muted-foreground">
                  Use Unicode for modern documentation or plain ASCII for older systems. Markdown
                  and JSON formats are also available.
                </p>
              </div>
            </li>
            <li class="grid gap-2 py-5 sm:grid-cols-[2rem_1fr] sm:gap-4">
              <span class="font-mono text-xs font-medium text-primary" aria-hidden="true">3</span>
              <div>
                <h3 class="font-semibold">Copy it into the README</h3>
                <p class="mt-2 leading-6 text-muted-foreground">
                  Put three backticks before and after the tree. The code block preserves spacing
                  and keeps the branches aligned.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section class="py-10 sm:py-12" aria-labelledby="format-heading">
          <h2 id="format-heading" class="text-2xl font-semibold tracking-[-0.025em]">
            Choose ASCII or Unicode
          </h2>
          <p class="mt-3 max-w-[65ch] leading-7 text-muted-foreground">
            Both formats are plain text. The difference is the set of branch characters.
          </p>
          <div class="mt-7 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
            <div class="bg-card p-5">
              <h3 class="font-semibold">Plain ASCII</h3>
              <pre class="mt-4 overflow-x-auto font-mono text-[13px] leading-6"><code>project/
|-- src/
|   `-- App.vue
`-- README.md</code></pre>
              <p class="mt-4 text-sm leading-6 text-muted-foreground">
                Use this format when a system does not support box-drawing characters.
              </p>
            </div>
            <div class="bg-card p-5">
              <h3 class="font-semibold">Unicode</h3>
              <pre class="mt-4 overflow-x-auto font-mono text-[13px] leading-6"><code>project/
├── src/
│   └── App.vue
└── README.md</code></pre>
              <p class="mt-4 text-sm leading-6 text-muted-foreground">
                Use this format for clearer branches in modern editors and Markdown.
              </p>
            </div>
          </div>
        </section>

        <section class="py-10 sm:py-12" aria-labelledby="command-heading">
          <h2 id="command-heading" class="text-2xl font-semibold tracking-[-0.025em]">
            Use the tree command when you do not need to edit
          </h2>
          <p class="mt-3 max-w-[65ch] leading-7 text-muted-foreground">
            A terminal command is useful when you need a direct view of an existing folder. Use
            Lupinum Tree when you want to edit the structure, compare formats, or plan folders that
            do not exist yet.
          </p>
          <div class="mt-7 space-y-3">
            <div class="rounded-lg bg-slate-950 p-4 text-slate-100">
              <p class="mb-3 text-xs text-slate-400">macOS and Linux</p>
              <pre class="overflow-x-auto font-mono text-[13px]"><code>tree</code></pre>
            </div>
            <div class="rounded-lg bg-slate-950 p-4 text-slate-100">
              <p class="mb-3 text-xs text-slate-400">Windows</p>
              <pre class="overflow-x-auto font-mono text-[13px]"><code>tree /F /A</code></pre>
            </div>
          </div>
        </section>

        <section class="py-10 sm:py-12" aria-labelledby="privacy-heading">
          <div class="flex items-start gap-4">
            <span
              class="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary"
            >
              <LockKeyhole class="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="privacy-heading" class="text-2xl font-semibold tracking-[-0.025em]">
                Your folder stays on your device
              </h2>
              <p class="mt-3 max-w-[65ch] leading-7 text-muted-foreground">
                Folder import reads names and hierarchy in your browser. It does not read file
                contents. It does not upload the tree. Saved trees remain in this browser.
              </p>
            </div>
          </div>
        </section>

        <section class="py-10 sm:py-12" aria-labelledby="questions-heading">
          <h2 id="questions-heading" class="text-2xl font-semibold tracking-[-0.025em]">
            Common questions
          </h2>
          <AccordionRoot type="single" collapsible class="mt-6">
            <AccordionItem
              v-for="faq in faqs"
              :key="faq.question"
              :value="faq.question"
              class="border-b last:border-b-0"
            >
              <AccordionHeader>
                <AccordionTrigger
                  data-slot="accordion-trigger"
                  class="group flex min-h-12 w-full items-center justify-between gap-4 py-3 text-left font-medium transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <span>{{ faq.question }}</span>
                  <ChevronDown
                    class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] group-data-[state=open]:rotate-180"
                    aria-hidden="true"
                  />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent force-mount class="guide-accordion-content">
                <div>
                  <p class="max-w-[65ch] pb-4 text-sm leading-6 text-muted-foreground">
                    {{ faq.answer }}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </section>

        <aside
          class="flex flex-col gap-5 bg-muted/45 px-5 py-7 sm:flex-row sm:items-center sm:justify-between"
          aria-label="Open Lupinum Tree"
        >
          <div>
            <h2 class="text-lg font-semibold">Create your directory tree</h2>
            <p class="mt-1 text-sm text-muted-foreground">No account, upload, or installation.</p>
          </div>
          <a
            href="/"
            class="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <ArrowLeft class="size-4" aria-hidden="true" />
            Open workbench
          </a>
        </aside>
      </article>
    </main>

    <footer class="mt-16 border-t bg-card/65">
      <div
        class="mx-auto grid max-w-5xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
      >
        <div class="flex max-w-lg items-start gap-3">
          <span
            class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs"
          >
            <FolderTree class="size-4" aria-hidden="true" />
          </span>
          <div>
            <p class="font-semibold text-foreground">Lupinum Tree</p>
            <p class="mt-1 text-sm leading-6 text-muted-foreground">
              A free and open-source developer tool by
              <a class="text-foreground underline underline-offset-4" href="https://lupinum.com"
                >Lupinum</a
              >.
            </p>
            <p class="mt-3 text-xs leading-5 text-muted-foreground">
              Core tree generation is adapted from
              <a
                class="text-foreground underline underline-offset-4"
                href="https://gitlab.com/nfriend/tree-online"
                target="_blank"
                rel="noopener noreferrer"
                >Nathan Friend's tree tool</a
              >
              under Apache-2.0.
            </p>
          </div>
        </div>
        <nav class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm" aria-label="Product links">
          <a class="hover:text-foreground" href="/">Workbench</a>
          <a
            class="inline-flex items-center gap-1.5 hover:text-foreground"
            href="https://github.com/lupinum-dev/lupinum-tree"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon class="size-3.5" />
            GitHub
          </a>
          <a class="hover:text-foreground" href="https://lupinum.com/datenschutz">Privacy</a>
          <a class="hover:text-foreground" href="https://lupinum.com/impressum">Legal notice</a>
          <a class="hover:text-foreground" href="https://lupinum.com/kontakt">Contact</a>
          <a
            class="inline-flex items-center gap-1 hover:text-foreground"
            href="https://lupinum.com"
          >
            Lupinum
            <ArrowUpRight class="size-3" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </footer>
  </div>
</template>
