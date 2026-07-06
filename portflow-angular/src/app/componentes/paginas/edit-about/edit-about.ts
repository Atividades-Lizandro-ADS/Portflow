import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { AboutService } from '../../../core/services/about.service';
import { HiringService } from '../../../core/services/hiring.service';
import { SkillService } from '../../../core/services/skill.service';
import { Hiring, Skill } from '../../../core/models/profile';
import { Program } from '../../../core/models/post';
import { Navbar } from '../../basico/navbar/navbar';
import { ImagePickerField } from '../../basico/image-picker-field/image-picker-field';
import { OptionChip } from '../../basico/option-chip/option-chip';
import { ProgramSearchField } from '../../basico/program-search-field/program-search-field';
import { BasicBtn } from '../../basico/basic-btn/basic-btn';

@Component({
  selector: 'app-edit-about',
  imports: [Navbar, ImagePickerField, OptionChip, ProgramSearchField, BasicBtn],
  templateUrl: './edit-about.html',
  styleUrl: './edit-about.scss',
})
export class EditAbout implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private profiles = inject(ProfileService);
  private abouts = inject(AboutService);
  private hirings = inject(HiringService);
  private skills = inject(SkillService);

  private user = toSignal(this.auth.currentUser$);

  loading = signal(true);
  saving = signal(false);
  error = signal('');

  private profileId = signal<number | null>(null);
  private aboutId = signal<number | null>(null);

  firstName = signal('');
  username = signal('');
  private initialUsername = signal('');
  usernameStatus = signal<'checking' | 'available' | 'taken' | null>(null);
  private usernameDebounce: ReturnType<typeof setTimeout> | null = null;

  private avatarFile = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);
  private bannerFile = signal<File | null>(null);
  bannerPreview = signal<string | null>(null);

  summary = signal('');
  selectedHiring = signal<Hiring[]>([]);
  selectedSkills = signal<Skill[]>([]);
  selectedPrograms = signal<Program[]>([]);

  hiringOptions = signal<Hiring[]>([]);
  skillOptions = signal<Skill[]>([]);

  usernameChanged = computed(() => this.username().trim() !== this.initialUsername());

  ngOnInit(): void {
    const id = this.user()?.profile_id;
    if (!id) {
      this.error.set('Você precisa estar logado.');
      this.loading.set(false);
      return;
    }
    this.profileId.set(id);

    Promise.all([
      lastValueFrom(this.profiles.get(id)),
      lastValueFrom(this.hirings.list()),
      lastValueFrom(this.skills.list()),
    ]).then(([profile, hiringOptions, skillOptions]) => {
      this.firstName.set(profile.first_name ?? '');
      this.username.set(profile.username ?? '');
      this.initialUsername.set(profile.username ?? '');
      this.avatarPreview.set(profile.user_picture);
      this.bannerPreview.set(profile.profile_banner);

      if (profile.about) {
        this.aboutId.set(profile.about.id);
        this.summary.set(profile.about.summary ?? '');
        this.selectedHiring.set(profile.about.hiring ?? []);
        this.selectedSkills.set(profile.about.skills ?? []);
        this.selectedPrograms.set(profile.about.programs_known ?? []);
      }

      this.hiringOptions.set(hiringOptions);
      this.skillOptions.set(skillOptions);
      this.loading.set(false);
    }).catch(() => {
      this.error.set('Erro ao carregar o perfil.');
      this.loading.set(false);
    });
  }

  isHiringSelected(id: number): boolean {
    return this.selectedHiring().some(h => h.id === id);
  }

  isSkillSelected(id: number): boolean {
    return this.selectedSkills().some(s => s.id === id);
  }

  onUsernameChange(value: string): void {
    const cleaned = value.replace(/\s/g, '_');
    this.username.set(cleaned);
    this.usernameStatus.set(null);
    if (this.usernameDebounce) clearTimeout(this.usernameDebounce);
    if (cleaned === this.initialUsername() || cleaned.length < 3) return;
    this.usernameStatus.set('checking');
    this.usernameDebounce = setTimeout(() => {
      this.auth.checkUsername(cleaned).subscribe({
        next: res => this.usernameStatus.set(res.available ? 'available' : 'taken'),
        error: () => this.usernameStatus.set(null),
      });
    }, 500);
  }

  onAvatarPicked(file: File): void {
    const old = this.avatarPreview();
    if (old?.startsWith('blob:')) URL.revokeObjectURL(old);
    this.avatarFile.set(file);
    this.avatarPreview.set(URL.createObjectURL(file));
  }

  onBannerPicked(file: File): void {
    const old = this.bannerPreview();
    if (old?.startsWith('blob:')) URL.revokeObjectURL(old);
    this.bannerFile.set(file);
    this.bannerPreview.set(URL.createObjectURL(file));
  }

  toggleHiring(item: Hiring): void {
    this.selectedHiring.update(list =>
      list.some(h => h.id === item.id) ? list.filter(h => h.id !== item.id) : [...list, item]
    );
  }

  toggleSkill(item: Skill): void {
    this.selectedSkills.update(list =>
      list.some(s => s.id === item.id) ? list.filter(s => s.id !== item.id) : [...list, item]
    );
  }

  addProgram(prog: Program): void {
    this.selectedPrograms.update(list => [...list, prog]);
  }

  removeProgram(id: number): void {
    this.selectedPrograms.update(list => list.filter(p => p.id !== id));
  }

  async submit(): Promise<void> {
    const id = this.profileId();
    if (!id) return;

    if (this.usernameChanged() && this.usernameStatus() === 'taken') {
      this.error.set('Username já está em uso.');
      return;
    }
    if (this.usernameChanged() && this.usernameStatus() === 'checking') {
      this.error.set('Aguarde a verificação do username.');
      return;
    }

    this.error.set('');
    this.saving.set(true);

    try {
      const profileForm = new FormData();
      profileForm.append('first_name', this.firstName().trim());
      if (this.usernameChanged()) profileForm.append('username', this.username().trim());
      if (this.avatarFile()) profileForm.append('user_picture', this.avatarFile()!);
      if (this.bannerFile()) profileForm.append('profile_banner', this.bannerFile()!);

      const tasks: Promise<unknown>[] = [lastValueFrom(this.profiles.update(id, profileForm))];

      const aboutId = this.aboutId();
      if (aboutId) {
        tasks.push(lastValueFrom(this.abouts.update(aboutId, {
          summary: this.summary().trim(),
          hiring: this.selectedHiring().map(h => h.id),
          skills: this.selectedSkills().map(s => s.id),
          programs_known: this.selectedPrograms().map(p => p.id),
        })));
      }

      await Promise.all(tasks);
      this.router.navigate(['/profile', id]);
    } catch (e: any) {
      const detail = e?.error;
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0];
        this.error.set(Array.isArray(first) ? (first as string[])[0] : String(first));
      } else {
        this.error.set('Erro ao salvar. Tente novamente.');
      }
    } finally {
      this.saving.set(false);
    }
  }
}
