import { ChangeType } from '../api/ChangeManagement';
import { RushConfiguration } from '../api/RushConfiguration';
import { Git } from '../logic/Git';

export class ConventionalCommits {
  private readonly _git: Git;

  public constructor(rushConfiguration: RushConfiguration) {
    this._git = new Git(rushConfiguration);
  }

  public getRecommendedChangeType(mergeCommitHash: string, projectFolder: string): string {
    if (this._isMajor(mergeCommitHash, projectFolder)) {
      return ChangeType[ChangeType.major];
    } else if (this._isMinor(mergeCommitHash, projectFolder)) {
      return ChangeType[ChangeType.minor];
    } else if (this._isPatch(mergeCommitHash, projectFolder)) {
      return ChangeType[ChangeType.patch];
    } else {
      return ChangeType[ChangeType.none];
    }
  }

  private _isMajor(mergeCommitHash: string, projectFolder: string): boolean {
    const cctypes = require('conventional-commit-types');
    const types: string = Object.keys(cctypes.types).join('|');
    const regexIsMajor: string = `(^(${types})(\(.*?\))?!:.*|^BREAKING CHANGE: )`;
    const isMajor: string = this._git.getFilteredCommits(mergeCommitHash, projectFolder, regexIsMajor);

    return parseInt(isMajor) > 0;
  }

  private _isMinor(mergeCommitHash: string, projectFolder: string): boolean {
    const regexIsMinor: string = '^feat((.*?))?:';
    const isMinor: string = this._git.getFilteredCommits(mergeCommitHash, projectFolder, regexIsMinor);
    return parseInt(isMinor) > 0;
  }

  private _isPatch(mergeCommitHash: string, projectFolder: string): boolean {
    const regexIsPatch: string = '^fix((.*?))?:';
    const isPatch: string = this._git.getFilteredCommits(mergeCommitHash, projectFolder, regexIsPatch);
    return parseInt(isPatch) > 0;
  }
}
