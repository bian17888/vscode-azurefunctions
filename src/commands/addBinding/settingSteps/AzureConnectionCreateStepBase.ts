/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Progress } from 'vscode';
import { AzureWizardExecuteStep } from 'vscode-azureextensionui';
import { setLocalAppSetting } from '../../../funcConfig/local.settings';
import { localize } from '../../../localize';
import { IBindingSetting } from '../../../templates/IBindingTemplate';
import { nonNullProp } from '../../../utils/nonNull';
import { setBindingSetting } from '../../createFunction/IFunctionWizardContext';
import { IBindingWizardContext } from '../IBindingWizardContext';

export interface IConnection {
    name: string;
    connectionString: string;
}

export abstract class AzureConnectionCreateStepBase<T extends IBindingWizardContext> extends AzureWizardExecuteStep<T> {
    public priority: number = 200;

    private readonly _setting: IBindingSetting;

    constructor(setting: IBindingSetting) {
        super();
        this._setting = setting;
    }

    public abstract async getConnection(wizardContext: T): Promise<IConnection>;

    public async execute(wizardContext: T, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        progress.report({ message: localize('retrieving', 'Retrieving connection string...') });

        const result: IConnection = await this.getConnection(wizardContext);
        const appSettingKey: string = `${result.name}_${nonNullProp(this._setting, 'resourceType').toUpperCase()}`;
        setBindingSetting(wizardContext, this._setting, appSettingKey);
        await setLocalAppSetting(wizardContext.projectPath, appSettingKey, result.connectionString);
    }
}
