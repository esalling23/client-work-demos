import { v4 as uuidv4 } from 'uuid';

export default class Bucket {
  constructor(number, gridPos, isOriginal, forcePlace) {
    this.key = uuidv4();
    // displayed number value
    this.number = number;
    // grid row and col position
    this.gridPos = gridPos || null;
    // if this bucket was one of the OG buckets created at item start
    this.isOriginal = isOriginal || false;
    // if this bucket should only display a single place, like ones, regardless of actual number
    this.forcePlace = forcePlace || null;
    // if this bucket is on it's way to a new location
    this.willMove = false;
    // if this bucket was just created via bucket breaking
    this.isSpawned = false;
    // if this bucket was just broken, and will soon be gone
    this.isBreaking = false;
    // if this bucket was just absorbed, and will soon be gone
    this.isLeaving = false;
    // if this bucket is absorbing another & its contents will change
    this.isGrowing = false;
  }
}
