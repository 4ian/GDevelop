// @flow
import { SearchFilter } from '../../UI/Search/UseSearchItem';
import {
  type AudioResourceV2,
  type FontResourceV2,
} from '../../Utils/GDevelopServices/Asset';

export class DurationResourceStoreSearchFilter
  implements SearchFilter<AudioResourceV2> {
  durationMin: number;
  durationMax: number;
  static durationMarks = [0, 2, 5, 20, 60, 300, 1800];

  constructor(
    durationMin: number = DurationResourceStoreSearchFilter.durationMarks[0],
    durationMax: number = DurationResourceStoreSearchFilter.durationMarks[
      DurationResourceStoreSearchFilter.durationMarks.length - 1
    ]
  ) {
    this.durationMin = durationMin;
    this.durationMax = durationMax;
  }

  getPertinence(searchItem: AudioResourceV2): number {
    if (
      searchItem.metadata.duration >= this.durationMin &&
      searchItem.metadata.duration <= this.durationMax
    ) {
      return 1;
    }
    return 0;
  }

  hasFilters(): boolean {
    return (
      this.durationMin !== DurationResourceStoreSearchFilter.durationMarks[0] ||
      this.durationMax !==
        DurationResourceStoreSearchFilter.durationMarks[
          DurationResourceStoreSearchFilter.durationMarks.length - 1
        ]
    );
  }
}

export class AudioTypeResourceStoreSearchFilter
  implements SearchFilter<AudioResourceV2> {
  type: 'sound' | 'music' | null;

  constructor(type: 'sound' | 'music' | null = null) {
    this.type = type;
  }

  getPertinence(searchItem: AudioResourceV2): number {
    if (this.type === null) return 1;
    return this.type === searchItem.metadata.type ? 1 : 0;
  }

  hasFilters(): boolean {
    return this.type !== null;
  }
}

export class AlphabetSupportResourceStoreSearchFilter
  implements SearchFilter<FontResourceV2> {
  alphabets: string[];

  constructor(alphabets?: string[]) {
    this.alphabets = alphabets || [];
  }

  getPertinence(searchItem: FontResourceV2): number {
    if (this.alphabets.length === 0) return 1;
    return this.alphabets.every(alphabet =>
      searchItem.metadata.supportedAlphabets.some(
        supportedAlphabet =>
          supportedAlphabet.replace('_limited', '') === alphabet
      )
    )
      ? 1
      : 0;
  }

  hasFilters(): boolean {
    return this.alphabets.length > 0;
  }
}
