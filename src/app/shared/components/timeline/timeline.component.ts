import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineEvent {
  status: string;
  date: string;
  description: string;
  completed: boolean;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      @for(event of events; track event.status; let i = $index) {
        <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          
          <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-background group-[.is-active]:bg-primary text-muted-foreground group-[.is-active]:text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" [class.border-primary]="event.completed" [class.bg-primary]="event.completed" [class.text-primary-foreground]="event.completed">
            <span class="text-sm font-bold">{{ event.completed ? '✓' : i + 1 }}</span>
          </div>

          <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm" [class.bg-muted]="!event.completed" [class.bg-card]="event.completed">
            <div class="flex items-center justify-between space-x-2 mb-1">
              <div class="font-bold tracking-tight" [class.text-foreground]="event.completed" [class.text-muted-foreground]="!event.completed">{{ event.status }}</div>
              @if(event.date) {
                <time class="text-xs font-medium" [class.text-foreground]="event.completed" [class.text-muted-foreground]="!event.completed">{{ event.date | date:'short' }}</time>
              }
            </div>
            <div class="text-sm" [class.text-muted-foreground]="event.completed" [class.opacity-50]="!event.completed">{{ event.description }}</div>
          </div>
          
        </div>
      }
    </div>
  `
})
export class TimelineComponent {
  @Input() events: TimelineEvent[] = [];
}
