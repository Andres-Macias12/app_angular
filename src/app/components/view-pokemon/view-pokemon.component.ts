import { ChangeDetectionStrategy, Component, computed, effect, OnDestroy, signal } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-view-pokemon',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule,
    InputTextModule,
    InputGroupModule,
    ToastModule,
    ButtonModule,
    RippleModule
  ],
  providers: [PokemonService, MessageService],  
  templateUrl: './view-pokemon.component.html',
  styleUrls: ['./view-pokemon.component.css'], 
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewPokemonComponent implements OnDestroy {
getBorderColor(arg0: any): any {
throw new Error('Method not implemented.');
}
pokemonList: any;
loadMoreInfo() {
throw new Error('Method not implemented.');
}
  pokemonNameOrId = signal('');
  loading = signal(false);
  pokemonData = signal<any>(null); 
  animationArray = signal<string[]>([]);
  indiceActual = signal(0);
  animating = signal(false);

  imagenActual = computed(() => {
    const array = this.animationArray();
    return array.length > 0 ? array[this.indiceActual()] : '';
  });

  constructor( 
    private pokemonService: PokemonService,
    private messageService: MessageService
  ) {
    effect(() => {
      if (this.animating()) {
        this.animateFrames();
      }
    });
  }

  ngOnDestroy(): void {
    this.detenerAnimacion();
  }

  playSound(soundSource: string) {
    const audio = new Audio();
    audio.src = soundSource;
    audio.load();
    audio.play();
  }

  loadPokemon() {
    if (this.pokemonNameOrId().length > 0) {
      this.detenerAnimacion();
      this.loading.set(true);
      this.pokemonService.getPokemon(this.pokemonNameOrId()).subscribe({
        next: (pokemon: any) => {  
          this.pokemonData.set(pokemon);
          this.loading.set(false);
          this.animationArray.set([
            pokemon.sprites.front_default,
            pokemon.sprites.back_default
          ]);
          this.iniciarAnimacion();
          this.playSound(this.pokemonData().cries.latest);
        },
        error: (err: any) => { 
          console.log(err);
          this.openSnackBarError();
          this.loading.set(false);
        }
      });
    } else {
      this.openSnackSinData();
    }
  }

  openSnackBarError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Nombre o id de Pokémon no válido' });
  }

  openSnackSinData() {
    this.messageService.add({ severity: 'warn', summary: 'Alerta', detail: 'Escriba un nombre o id para cargar' });
  }

  iniciarAnimacion() {
    this.indiceActual.set(0);
    this.animating.set(true);
  }

  animateFrames() {
    setTimeout(() => {
      if (this.animating()) {
        this.indiceActual.update(index => (index + 1) % this.animationArray().length);
        this.animateFrames();
      }
    }, 450);
  }

  detenerAnimacion() {
    this.animating.set(false);
  }

  updateName(name: string) {
    this.pokemonNameOrId.set(name.toLocaleLowerCase());
  }
}


