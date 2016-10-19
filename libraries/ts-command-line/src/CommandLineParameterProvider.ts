/**
 * @Copyright (c) Microsoft Corporation.  All rights reserved.
 */

import * as argparse from 'argparse';
import {
  IBaseCommandLineDefinition,
  ICommandLineFlagDefinition,
  ICommandLineStringDefinition,
  ICommandLineIntegerDefinition
} from './CommandLineDefinition';

import {
  CommandLineParameter,
  ICommandLineParserData,
  IConverterFunction,
  CommandLineFlagParameter,
  CommandLineStringParameter,
  CommandLineIntegerParameter
} from './CommandLineParameter';

/**
 * This is the common base class for CommandLineAction and CommandLineParser
 * that provides functionality for defining command-line parameters.
 */
abstract class CommandLineParameterProvider {
  private static _keyCounter: number = 0;

  protected argumentParser: argparse.ArgumentParser;
  /* tslint:disable-next-line:no-any */
  private _parameters: CommandLineParameter<any>[];

  constructor() {
    this._parameters = [];
  }

  /**
   * The child class should implement this hook to define its command-line parameters,
   * e.g. by calling defineFlagParameter().
   */
  protected abstract onDefineParameters(): void;

  /**
   * Defines a flag parameter.  See ICommandLineFlagDefinition for details.
   */
  protected defineFlagParameter(options: ICommandLineFlagDefinition): CommandLineFlagParameter {
    return this._createParameter(options, {
      action: 'storeTrue'
    }) as CommandLineFlagParameter;
  }

  /**
   * Defines a string parameter.
   */
  protected defineStringParameter(options: ICommandLineStringDefinition): CommandLineStringParameter {
    return this._createParameter(options) as CommandLineStringParameter;
  }

  /**
   * Defines an integer parameter
   */
  protected defineIntegerParameter(options: ICommandLineIntegerDefinition): CommandLineIntegerParameter {
    return this._createParameter(options, {
      type: 'int'
    }) as CommandLineIntegerParameter;
  }

  protected processParsedData(data: ICommandLineParserData): void {
    // Fill in the values for the parameters
    for (const parameter of this._parameters) {
      parameter.setValue(data);
    }
  }

  private _createKeyName(): string {
    return 'key_' + (CommandLineParameterProvider._keyCounter++).toString();
  }

  private _createParameter(definition: IBaseCommandLineDefinition,
                           argparseOptions?: argparse.ArgumentOptions,
                           /* tslint:disable-next-line:no-any */
                           converter?: IConverterFunction<any>): CommandLineParameter<any> {
    const names: string[] = [];
    if (definition.parameterShortName) {
      names.push(definition.parameterShortName);
    }
    names.push(definition.parameterLongName);

    /* tslint:disable-next-line:no-any */
    const result: CommandLineParameter<any> = new CommandLineParameter<any>(this._createKeyName(), converter);

    this._parameters.push(result);

    const baseArgparseOptions: argparse.ArgumentOptions = {
      help: definition.description,
      dest: result.key
    };

    Object.keys(argparseOptions || {}).forEach((key: string) => {
      baseArgparseOptions[key] = argparseOptions[key];
    });

    this.argumentParser.addArgument(names, baseArgparseOptions);
    return result;
  }
}

export default CommandLineParameterProvider;
