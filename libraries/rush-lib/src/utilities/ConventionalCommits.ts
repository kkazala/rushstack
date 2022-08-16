import { ChangeType } from '../api/ChangeManagement';
import { RushConfiguration } from '../api/RushConfiguration';
import { Git } from '../logic/Git';

export interface IConventionalCommitsTypes {
  types: {
    [key: string]: {
      description: string;
      title: string;
    };
  };
}
export class ConventionalCommits {
  private readonly _git: Git;
  private _since: Date | undefined;

  public constructor(rushConfiguration: RushConfiguration, since: Date | undefined) {
    this._git = new Git(rushConfiguration);
    this._since = since;
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
    const cctypes: IConventionalCommitsTypes = require('conventional-commit-types');
    const types: string = Object.keys(cctypes.types).join('|');
    const regexIsMajor: string = `(^(${types})(\(.*?\))?!:.*|^BREAKING CHANGE: )`;
    const isMajor: string = this._git.getFilteredCommits(
      mergeCommitHash,
      this._since,
      projectFolder,
      regexIsMajor
    );

    return parseInt(isMajor) > 0;
  }

  private _isMinor(mergeCommitHash: string, projectFolder: string): boolean {
    const regexIsMinor: string = '^feat((.*?))?:';
    const isMinor: string = this._git.getFilteredCommits(
      mergeCommitHash,
      this._since,
      projectFolder,
      regexIsMinor
    );
    return parseInt(isMinor) > 0;
  }

  private _isPatch(mergeCommitHash: string, projectFolder: string): boolean {
    const regexIsPatch: string = '^fix((.*?))?:';
    const isPatch: string = this._git.getFilteredCommits(
      mergeCommitHash,
      this._since,
      projectFolder,
      regexIsPatch
    );
    return parseInt(isPatch) > 0;
  }
}
