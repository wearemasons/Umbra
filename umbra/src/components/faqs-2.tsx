'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How does Umbra process research papers?',
            answer: 'Umbra uses advanced AI models to automatically process each research paper. It generates concise summaries, highlights key insights, and identifies connections to other related works in the database.',
        },
        {
            id: 'item-2',
            question: 'What kind of insights can I get from Umbra?',
            answer: 'Umbra helps you discover hidden patterns and trends in research. The interactive graph visualizes relationships between studies, allowing you to see how different research areas are connected and identify emerging themes.',
        },
        {
            id: 'item-3',
            question: 'How does the interactive graph work?',
            answer: 'The interactive graph is a visual representation of the relationships between research papers. You can click on individual papers to see their summaries and connections, and explore the graph to navigate the scientific landscape.',
        },
        {
            id: 'item-4',
            question: 'What fields of research does Umbra cover?',
            answer: 'Umbra is designed to be a cross-disciplinary platform. While our initial focus is on the natural sciences, we are continuously expanding our database to include a wide range of research fields.',
        },
        {
            id: 'item-5',
            question: 'Can I contribute my own research to Umbra?',
            answer: 'We are working on features that will allow researchers to add their own papers to the Umbra database. Stay tuned for updates on this feature!',
        },
    ]

    return (
        <section className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Questions About Umbra?</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Find answers to common questions about Umbra{`'`}s features, data processing, and how it can benefit your research.</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8">
                        Have more questions? Contact our{' '}
                        <Link
                            href="#"
                            className="text-primary font-medium hover:underline">
                            research support team
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
