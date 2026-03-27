import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  template: `
    <div class="max-w-4xl mx-auto py-12 px-4">
      <div class="mb-10 text-center">
        <h1 class="text-4xl font-black tracking-tight uppercase mb-2">My Profile</h1>
        <p class="text-muted-foreground">Manage your account details and preferences.</p>
      </div>

      <div class="grid gap-8 md:grid-cols-3">
        <!-- Sidebar/Avatar -->
        <div class="md:col-span-1">
          <div class="rounded-3xl bg-neutral-100 p-8 flex flex-col items-center text-center">
            <div class="w-32 h-32 rounded-full bg-black text-white flex items-center justify-center text-4xl font-black mb-4">
              {{ initials() }}
            </div>
            <h2 class="text-xl font-bold">{{ profile()?.name }}</h2>
            <p class="text-sm text-muted-foreground mb-4">{{ profile()?.email }}</p>
            <app-badge [variant]="profile()?.role === 'Admin' ? 'default' : 'secondary'">
              {{ profile()?.role }}
            </app-badge>
          </div>
        </div>

        <!-- Main Details -->
        <div class="md:col-span-2 space-y-6">
          <app-card title="Account Information">
            <div class="space-y-4 py-2">
              <div class="flex flex-col sm:flex-row sm:justify-between border-b border-neutral-100 pb-4">
                <span class="text-sm font-medium text-muted-foreground">Full Name</span>
                <span class="font-bold">{{ profile()?.name }}</span>
              </div>
              <div class="flex flex-col sm:flex-row sm:justify-between border-b border-neutral-100 pb-4">
                <span class="text-sm font-medium text-muted-foreground">Email Address</span>
                <span class="font-bold">{{ profile()?.email }}</span>
              </div>
              <div class="flex flex-col sm:flex-row sm:justify-between border-b border-neutral-100 pb-4">
                <span class="text-sm font-medium text-muted-foreground">Account Type</span>
                <span class="font-bold">{{ profile()?.role }}</span>
              </div>
              <div class="flex flex-col sm:flex-row sm:justify-between pt-2">
                <span class="text-sm font-medium text-muted-foreground">Member Since</span>
                <span class="font-bold">{{ profile()?.createdAt | date:'longDate' }}</span>
              </div>
            </div>
          </app-card>

          <app-card title="Security">
            <div class="flex items-center justify-between py-2">
              <div>
                <p class="font-bold">Password</p>
                <p class="text-xs text-muted-foreground">Last updated 3 months ago</p>
              </div>
              <button class="text-sm font-black underline uppercase tracking-tighter">Change</button>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  
  profile = signal<any>(null);
  initials = signal<string>('?');

  ngOnInit() {
    const user = this.auth.currentUserValue;
    if (user) {
      this.auth.getProfile(user.id).subscribe({
        next: data => {
          this.profile.set(data);
          this.initials.set(this.getInitials(data.name));
        },
        error: err => console.error('Failed to load profile', err)
      });
    }
  }

  private getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
