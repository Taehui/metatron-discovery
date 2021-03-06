/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable, Injector } from '@angular/core';
import { AbstractService } from '../../../common/service/abstract.service';
import { Dataflow, Dataflows } from '../../../domain/data-preparation/dataflow';
import { Dataset, Datasets } from '../../../domain/data-preparation/dataset';
import { DataSnapshot } from '../../../domain/data-preparation/data-snapshot';
import { Page } from '../../../domain/common/page';
import { CommonUtil } from '../../../common/util/common.util';
import { StringUtil } from '../../../common/util/string.util';
import { Loading } from '../../../common/util/loading.util';
import { isNullOrUndefined, isUndefined } from 'util';
import { PreparationAlert } from '../../util/preparation-alert.util';
import { PopupService } from '../../../common/service/popup.service';
import { TranslateService } from 'ng2-translate';

@Injectable()
export class DataflowService extends AbstractService {

  constructor(protected injector: Injector,
              private popupService: PopupService,
              public translateService: TranslateService
  ) {
    super(injector);
  }

  // 데이터 플로우 목록 조회
  public getDataflows(searchText: string, page: Page, projection: string = 'forListView'): Promise<Dataflows> {
    let url = this.API_URL + `preparationdataflows/search/findByDfNameContaining?dfName=${encodeURIComponent(searchText)}&project=${projection}`;

    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  // 데이터 플로우 상세조회
  public getDataflow(dfId: string): Promise<Dataflow> {
    const url = this.API_URL + 'preparationdataflows/' + dfId;
    return this.get(url);
  }

  // 업스트림 조회
  public getUpstreams(dfId: string, isUpdate?: boolean): Promise<any> {
    let url = this.API_URL + 'preparationdataflows/' + dfId + '/upstreammap';
    if (isUpdate) {
      url += '?forUpdate=' + isUpdate;
    }
    return this.get(url);
  }

  // 데이터셋 목록 조회
  public getDatasets(searchText: string, page: Page, projection?: string, dsType: string = '', importType: string = ''): Promise<Datasets> {

    let url = this.API_URL + `preparationdatasets/search/`;

    if (StringUtil.isNotEmpty(dsType)) {
      url += `findByDsNameContainingAndDsType?dsType=${dsType}`;

    } else {
      url += 'findByDsNameContaining?';
    }

    url += `&dsName=${encodeURIComponent(searchText)}`;
    url += `&projection=${projection}`;
    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  // 데이터셋 상세 조회
  public getDataset(dsId: string): Promise<Dataset> {
    const url = this.API_URL + 'preparationdatasets/' + dsId;
    return this.get(url);
  }

  // 데이터 플로우 생성
  public createDataflow(dataflow: Dataflow) {
    let popupService = this.popupService;
    return this.post(this.API_URL + 'preparationdataflows', dataflow)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 데이터 플로우 삭제
  public deleteDataflow(dfId: string) {
    let popupService = this.popupService;
    return this.delete(this.API_URL + 'preparationdataflows/' + dfId)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 데이터 플로우 수정
  public updateDataflow(dataflow: any): Promise<Dataflow> {
    let popupService = this.popupService;
    return this.patch(this.API_URL + 'preparationdataflows/' + dataflow.dfId, dataflow)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 데이터 플로우 룰생성
  public createWrangledDataset(datasetId: string, dataflowId: string): Promise<any> {
    let popupService = this.popupService;
    const params = { dfId: dataflowId };
    return this.post(this.API_URL + `preparationdatasets/${datasetId}/transform`, params)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 데이터 플로우 룰생성
  public previewJoinResult(datasetId: string, op: string, ruleStr: string): Promise<any> {
    let popupService = this.popupService;
    const params: any = { dsId: datasetId, op: op, ruleString: ruleStr };
    return this.put(this.API_URL + `preparationdatasets/${datasetId}/transform/preview`, params)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  } // function - previewJoinResult

  // 룰 JUMP
  public jumpRule(datasetId: string, op: string, ruleIdx: number): Promise<any> {
    let popupService = this.popupService;
    const params: any = { dsId: datasetId, op: op, ruleIdx: ruleIdx };
    return this.put(this.API_URL + `preparationdatasets/${datasetId}/transform`, params)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  } // function - previewJoinResult

  // FILE 데이터셋 조회
  public getDatasetFileData(filekey: string, sheetname?: string): Promise<any> {
    let url = this.API_URL + `preparationdatasets/file/${filekey}?hasFields=Y`;
    if (!isUndefined(sheetname)) {
      url = url + `&sheetname=${encodeURI(sheetname)}`;
    }
    return this.get(url);
  }

  // Wrangled 데이터셋 조회
  public getDatasetWrangledData(datasetId: string, count?: number, pageNum?: number, ruleIdx?: number): Promise<any> {

    let url = this.API_URL + `preparationdatasets/${datasetId}/transform`;

    const params: string[] = [];
    (isNullOrUndefined(ruleIdx)) || (params.push(`ruleIdx=${ruleIdx}`));
    (isNullOrUndefined(pageNum)) || (params.push(`pageNum=${pageNum}`));
    (isNullOrUndefined(count)) || (params.push(`count=${count}`));
    (0 < params.length) && (url = url + '?' + params.join('&'));

    return this.get(url);
  }

  // 데이터셋 추가
  public updateDataSets(dataflowId: string, dsIds: any): Promise<any> {
    return this.put(this.API_URL + `preparationdataflows/${dataflowId}/update_datasets`, dsIds);
  }

  // 데이터 스냅샷 생성
  public checkHiveTable(schema: string, table: string): Promise<any> {
    return this.get(this.API_URL + `preparationsnapshots/check_table/${schema}/${table}`);
  }


  // fileUri등 설정 정보
  public getConfiguration(datasetId: string): Promise<any> {
    let popupService = this.popupService;
    return this.get(this.API_URL + `preparationdatasets/${datasetId}/transform/configuration`)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 데이터 스냅샷 생성
  public createDataSnapshot(datasetId: string, datasnapshot: DataSnapshot): Promise<any> {
    let popupService = this.popupService;
    return this.post(this.API_URL + `preparationdatasets/${datasetId}/transform/snapshot`, datasnapshot)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 룰 적용
  public applyRules(datasetId: string, rule: any): Promise<any> {
    let popupService = this.popupService;
    return this.put(this.API_URL + `preparationdatasets/${datasetId}/transform`, rule)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // get gridResponse search
  public getSearchDataSets(datasetId: string, searchText: string) {
    let popupService = this.popupService;
    return this.get(this.API_URL + `preparationdatasets/${datasetId}/transform` + `/` + encodeURIComponent(searchText))
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // get gridResponse search
  public getDataSetsLimit(datasetId: string, count: number) {
    let popupService = this.popupService;
    return this.get(this.API_URL + `preparationdatasets/${datasetId}/transform?count=` + count)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  /* searchText 제거
  public getSearchCountDataSets(datasetId: string, searchWord: string, count: number) {
    let popupService = this.popupService;
    return this.get(this.API_URL + `preparationdatasets/${datasetId}/transform?searchWord=` + encodeURIComponent(searchWord) + '&targetLines=' + count)
  */
  public getSearchCountDataSets(datasetId: string, ruleIdx?: number, pageNum?: number, count?: number) {
    let popupService = this.popupService;
    let url = this.API_URL + `preparationdatasets/${datasetId}/transform`;

    const params: string[] = [];
    (isNullOrUndefined(ruleIdx)) || (params.push(`ruleIdx=${ruleIdx}`));
    (isNullOrUndefined(pageNum)) || (params.push(`pageNum=${pageNum}`));
    (isNullOrUndefined(count)) || (params.push(`count=${count}`));
    (0 < params.length) && (url = url + '?' + params.join('&'));

    return this.get(url)
    // return this.get(this.API_URL + `preparationdatasets/${datasetId}/transform`)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // when editing, getting previous data
  public fetchPreviousData(datasetId: string, op: any): Promise<any> {
    let popupService = this.popupService;
    return this.put(this.API_URL + `preparationdatasets/${datasetId}/transform`, op)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  public deleteChainDataflow(dfId: string, dsId: string) {
    return this.delete(this.API_URL + 'preparationdataflows/delete_chain/' + dfId + '/' + dsId);
  }

  // removes dataset from selected dataflow
  public removeDataset(dfId, dsId): Promise<any> {
    return this.delete(this.API_URL + `preparationdataflows/${dfId}/remove/${dsId}`);
  }

  public cloneWrangledDataset(dsId: string): Promise<any> {
    let params = {};
    return this.post(this.API_URL + `preparationdatasets/${dsId}/clone`, params);
  }

  public autoComplete(ruleString: string, ruleCommand: string, rulePart: string): Promise<any> {
    let params = {
      'ruleString': ruleString,
      'ruleCommand': ruleCommand,
      'rulePart': rulePart
    };
    return this.post(this.API_URL + `preparationdatasets/autocomplete`, params);
  }

  public parseRule(ruleString: string): Promise<any> {
    return this.post(this.API_URL + `preparationdatasets/parse_rule`, ruleString);
  }

  public validateExpr(exprString: string): Promise<any> {
    return this.post(this.API_URL + `preparationdatasets/validate_expr`, exprString);
  }

  /**
   * 각 컬럼별 히스토그램 정보 조회
   * @param {string} dsId
   * @param {any} params
   * {
   *    ruleIdx      : 몇 번째 ruleIdx에 해당하는 histogram을 얻을 것인지
   *    colnos[]     : histogram을 얻으려는 column number array
   *    colWidths[]  : 위의 각 column의 확정된 column 폭
   * }
   * @returns {Promise<any>}
   */
  public getHistogramInfo(dsId: string, params: any): Promise<any> {
    return this.post(this.API_URL + `preparationdatasets/${dsId}/transform/histogram`, params)
  }


  /**
   * 타임스탬프 format 중 가장 유사한 format을 추천해주는 리스트
   * @param {string} datasetId
   * @param colNames
   * @return {Promise<any>}
   */
  public getTimestampFormatSuggestions(datasetId : string, colNames : any ) : Promise<any> {
    let url = this.API_URL + `preparationdatasets/${datasetId}/transform/timestampFormat`;
    return this.post(url,colNames);
  } // function - getTimestampFormatSuggestions

  /**
   * 룰 편집 화면에서 스냅샷 탭 목록 불러오기
   * @param {string} datasetId
   * @return {Promise<any>}
   */
  public getWorkList(dsId: string): Promise<any> {
    let url = this.API_URL + 'preparationsnapshots/' + dsId + '/work_list';
    return this.get(url);
  }
}
