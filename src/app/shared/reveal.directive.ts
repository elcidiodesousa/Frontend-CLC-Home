import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject} from '@angular/core';

/**
 * Revela o elemento quando entra no ecrã.
 *   <h2 appReveal>…</h2>                -> o próprio elemento aparece
 *   <div appReveal="stagger">…</div>    -> os filhos aparecem em cascata
 * Respeita `prefers-reduced-motion`.
 */
@Directive({selector: '[appReveal]', standalone: true})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input('appReveal') mode: '' | 'stagger' = '';
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    node.classList.add(this.mode === 'stagger' ? 'reveal-stagger' : 'reveal');
    this.observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        node.classList.add('in');
        this.observer?.disconnect();
      }
    }, {threshold: 0.12, rootMargin: '0px 0px -6% 0px'});
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
